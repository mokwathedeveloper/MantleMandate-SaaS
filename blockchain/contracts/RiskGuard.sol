// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RiskGuard
 * @notice On-chain risk parameter enforcement for MantleMandate AI agents.
 *         Stores risk parameters per agent and validates orders against them
 *         before execution. All percentages are expressed in basis points
 *         (1 bps = 0.01%, 10000 bps = 100%).
 *
 * Deployed on Mantle Network (chainId 5000 / testnet 5003).
 */
contract RiskGuard {

    // ── Types ────────────────────────────────────────────────────────────────

    struct RiskParams {
        uint256 maxDrawdownBps;   // maximum drawdown from peak, e.g. 1000 = 10%
        uint256 maxPositionBps;   // max single position as % of capital, e.g. 500 = 5%
        uint256 stopLossBps;      // per-trade stop loss trigger, e.g. 300 = 3%
        uint256 maxPositions;     // max concurrent open positions
        uint256 cooldownSeconds;  // minimum seconds between trades (0 = no cooldown)
    }

    struct AgentRiskState {
        RiskParams params;
        uint256    openPositions;
        uint256    peakCapital;     // high-water mark in capital units
        uint256    currentCapital;  // current capital in same units
        uint64     lastTradeAt;
        bool       initialized;
    }

    // ── Storage ──────────────────────────────────────────────────────────────

    mapping(uint256 => AgentRiskState) private _state;
    mapping(uint256 => address)        private _agentOwners;

    // ── Events ───────────────────────────────────────────────────────────────

    event RiskParamsSet(uint256 indexed agentId, RiskParams params);
    event PositionOpened(uint256 indexed agentId, uint256 openPositions);
    event PositionClosed(uint256 indexed agentId, uint256 openPositions, uint256 currentCapital);
    event DrawdownBreached(uint256 indexed agentId, uint256 drawdownBps);

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAgentOwner(uint256 agentId) {
        require(_agentOwners[agentId] == msg.sender, "RiskGuard: not owner");
        _;
    }

    modifier initialized(uint256 agentId) {
        require(_state[agentId].initialized, "RiskGuard: not initialized");
        _;
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Initialise risk parameters for an agent.
     * @param agentId         Off-chain agent ID (must be unique per owner).
     * @param params          Risk configuration.
     * @param initialCapital  Starting capital in token base units.
     */
    function setRiskParams(
        uint256    agentId,
        RiskParams calldata params,
        uint256    initialCapital
    ) external {
        require(params.maxDrawdownBps <= 10_000, "RiskGuard: drawdown > 100%");
        require(params.maxPositionBps <= 10_000, "RiskGuard: position > 100%");
        require(params.stopLossBps    <= 10_000, "RiskGuard: stop loss > 100%");
        require(params.maxPositions   >  0,      "RiskGuard: zero max positions");
        require(initialCapital        >  0,      "RiskGuard: zero capital");

        AgentRiskState storage s = _state[agentId];
        s.params          = params;
        s.peakCapital     = initialCapital;
        s.currentCapital  = initialCapital;
        s.openPositions   = 0;
        s.lastTradeAt     = 0;
        s.initialized     = true;
        _agentOwners[agentId] = msg.sender;

        emit RiskParamsSet(agentId, params);
    }

    /**
     * @notice Validate and record a new order.
     *         Reverts with the specific rule violated.
     * @param agentId      Agent placing the order.
     * @param orderValue   Value of the order in capital units.
     * @param capitalBase  Total capital base for percentage calculations.
     */
    function checkOrder(
        uint256 agentId,
        uint256 orderValue,
        uint256 capitalBase
    ) external initialized(agentId) {
        AgentRiskState storage s = _state[agentId];
        RiskParams     storage p = s.params;

        require(capitalBase > 0, "RiskGuard: zero capital base");

        // ── Rule 1: max concurrent positions ─────────────────────────────────
        require(s.openPositions < p.maxPositions, "RiskGuard: max positions reached");

        // ── Rule 2: position size ─────────────────────────────────────────────
        uint256 positionBps = (orderValue * 10_000) / capitalBase;
        require(positionBps <= p.maxPositionBps, "RiskGuard: position too large");

        // ── Rule 3: cooldown between trades ───────────────────────────────────
        if (p.cooldownSeconds > 0 && s.lastTradeAt > 0) {
            require(
                block.timestamp >= uint256(s.lastTradeAt) + p.cooldownSeconds,
                "RiskGuard: cooldown active"
            );
        }

        // ── Rule 4: drawdown guard ────────────────────────────────────────────
        if (s.currentCapital < s.peakCapital) {
            uint256 drawdownBps = ((s.peakCapital - s.currentCapital) * 10_000) / s.peakCapital;
            if (drawdownBps > p.maxDrawdownBps) {
                emit DrawdownBreached(agentId, drawdownBps);
                revert("RiskGuard: drawdown exceeded");
            }
        }

        // Record the open position
        s.openPositions++;
        s.lastTradeAt = uint64(block.timestamp);

        emit PositionOpened(agentId, s.openPositions);
    }

    /**
     * @notice Record a position close and update the capital tracking.
     * @param agentId   Agent closing the position.
     * @param pnl       Absolute PnL amount in capital units.
     * @param isProfit  True if pnl is a gain, false if a loss.
     */
    function closePosition(
        uint256 agentId,
        uint256 pnl,
        bool    isProfit
    ) external onlyAgentOwner(agentId) initialized(agentId) {
        AgentRiskState storage s = _state[agentId];
        require(s.openPositions > 0, "RiskGuard: no open positions");

        s.openPositions--;

        if (isProfit) {
            s.currentCapital += pnl;
            if (s.currentCapital > s.peakCapital) {
                s.peakCapital = s.currentCapital;
            }
        } else {
            s.currentCapital = pnl >= s.currentCapital ? 0 : s.currentCapital - pnl;
        }

        emit PositionClosed(agentId, s.openPositions, s.currentCapital);
    }

    /**
     * @notice Force-update the capital base (e.g. after an external deposit).
     */
    function updateCapital(
        uint256 agentId,
        uint256 newCapital
    ) external onlyAgentOwner(agentId) initialized(agentId) {
        require(newCapital > 0, "RiskGuard: zero capital");
        AgentRiskState storage s = _state[agentId];
        s.currentCapital = newCapital;
        if (newCapital > s.peakCapital) {
            s.peakCapital = newCapital;
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    function getRiskParams(uint256 agentId) external view returns (RiskParams memory) {
        return _state[agentId].params;
    }

    function getRiskState(uint256 agentId) external view returns (
        uint256 openPositions,
        uint256 peakCapital,
        uint256 currentCapital,
        uint64  lastTradeAt,
        uint256 drawdownBps
    ) {
        AgentRiskState storage s = _state[agentId];
        openPositions  = s.openPositions;
        peakCapital    = s.peakCapital;
        currentCapital = s.currentCapital;
        lastTradeAt    = s.lastTradeAt;
        drawdownBps    = (s.peakCapital > 0 && s.currentCapital < s.peakCapital)
            ? ((s.peakCapital - s.currentCapital) * 10_000) / s.peakCapital
            : 0;
    }

    function currentDrawdownBps(uint256 agentId) external view returns (uint256) {
        AgentRiskState storage s = _state[agentId];
        if (s.peakCapital == 0 || s.currentCapital >= s.peakCapital) return 0;
        return ((s.peakCapital - s.currentCapital) * 10_000) / s.peakCapital;
    }

    function isInitialized(uint256 agentId) external view returns (bool) {
        return _state[agentId].initialized;
    }
}
