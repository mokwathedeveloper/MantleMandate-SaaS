// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MandatePolicy.sol";

/**
 * @title AgentExecutor
 * @notice On-chain registry for MantleMandate AI agent lifecycle and trade execution.
 *         Each agent is linked to a verified MandatePolicy hash. All executions
 *         are recorded immutably for audit purposes.
 *
 * Deployed on Mantle Network (chainId 5000 / testnet 5003).
 */
contract AgentExecutor {

    // ── Types ────────────────────────────────────────────────────────────────

    enum AgentStatus { Inactive, Active, Paused, Stopped }

    struct Agent {
        address owner;
        bytes32 policyHash;
        address mandatePolicyContract;
        AgentStatus status;
        uint64  createdAt;
        uint64  lastExecutedAt;
        uint256 totalExecutions;
    }

    struct ExecutionRecord {
        uint256 agentId;
        bytes32 asset;        // keccak256 of asset symbol, e.g. keccak256("ETH")
        uint256 amount;       // order size in token base units
        bool    isBuy;
        uint64  executedAt;
        bytes32 txRef;        // off-chain reference hash (e.g. CEX order ID)
    }

    // ── Storage ──────────────────────────────────────────────────────────────

    uint256 private _nextAgentId;

    mapping(uint256 => Agent)            private _agents;
    mapping(uint256 => ExecutionRecord[]) private _executions;
    mapping(address => uint256[])        private _ownerAgents;

    // ── Events ───────────────────────────────────────────────────────────────

    event AgentRegistered(
        address indexed owner,
        uint256 indexed agentId,
        bytes32         policyHash
    );

    event AgentStatusChanged(
        uint256 indexed agentId,
        AgentStatus     status
    );

    event OrderExecuted(
        uint256 indexed agentId,
        bytes32 indexed asset,
        uint256         amount,
        bool            isBuy,
        uint256         execIndex
    );

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAgentOwner(uint256 agentId) {
        require(_agents[agentId].owner == msg.sender, "AgentExecutor: not owner");
        _;
    }

    modifier agentExists(uint256 agentId) {
        require(_agents[agentId].owner != address(0), "AgentExecutor: not found");
        _;
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Register a new agent linked to a verified on-chain policy.
     * @param policyHash              SHA-256 hash of the mandate policy JSON.
     * @param mandatePolicyContract   Address of the deployed MandatePolicy contract.
     * @return agentId                The newly assigned agent ID.
     */
    function registerAgent(
        bytes32 policyHash,
        address mandatePolicyContract
    ) external returns (uint256 agentId) {
        require(policyHash != bytes32(0),           "AgentExecutor: zero hash");
        require(mandatePolicyContract != address(0),"AgentExecutor: zero address");

        MandatePolicy mp = MandatePolicy(mandatePolicyContract);
        require(
            mp.verifyPolicy(msg.sender, policyHash),
            "AgentExecutor: policy not verified"
        );

        agentId = _nextAgentId++;
        _agents[agentId] = Agent({
            owner:                  msg.sender,
            policyHash:             policyHash,
            mandatePolicyContract:  mandatePolicyContract,
            status:                 AgentStatus.Inactive,
            createdAt:              uint64(block.timestamp),
            lastExecutedAt:         0,
            totalExecutions:        0
        });
        _ownerAgents[msg.sender].push(agentId);

        emit AgentRegistered(msg.sender, agentId, policyHash);
    }

    /**
     * @notice Activate an Inactive or Paused agent.
     */
    function activateAgent(uint256 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        Agent storage a = _agents[agentId];
        require(
            a.status == AgentStatus.Inactive || a.status == AgentStatus.Paused,
            "AgentExecutor: cannot activate"
        );
        a.status = AgentStatus.Active;
        emit AgentStatusChanged(agentId, AgentStatus.Active);
    }

    /**
     * @notice Pause an Active agent.
     */
    function pauseAgent(uint256 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        require(_agents[agentId].status == AgentStatus.Active, "AgentExecutor: not active");
        _agents[agentId].status = AgentStatus.Paused;
        emit AgentStatusChanged(agentId, AgentStatus.Paused);
    }

    /**
     * @notice Resume a Paused agent.
     */
    function resumeAgent(uint256 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        require(_agents[agentId].status == AgentStatus.Paused, "AgentExecutor: not paused");
        _agents[agentId].status = AgentStatus.Active;
        emit AgentStatusChanged(agentId, AgentStatus.Active);
    }

    /**
     * @notice Stop an agent permanently.
     */
    function stopAgent(uint256 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        require(
            _agents[agentId].status != AgentStatus.Stopped,
            "AgentExecutor: already stopped"
        );
        _agents[agentId].status = AgentStatus.Stopped;
        emit AgentStatusChanged(agentId, AgentStatus.Stopped);
    }

    /**
     * @notice Record an executed trade order.
     * @param agentId   Agent performing the trade.
     * @param asset     keccak256 of the asset symbol.
     * @param amount    Order size in token base units.
     * @param isBuy     True for buy, false for sell.
     * @param txRef     Off-chain reference hash (CEX order ID, DEX tx hash, etc.).
     */
    function executeOrder(
        uint256 agentId,
        bytes32 asset,
        uint256 amount,
        bool    isBuy,
        bytes32 txRef
    ) external onlyAgentOwner(agentId) agentExists(agentId) {
        require(_agents[agentId].status == AgentStatus.Active, "AgentExecutor: agent not active");
        require(amount > 0, "AgentExecutor: zero amount");

        uint256 execIndex = _executions[agentId].length;
        _executions[agentId].push(ExecutionRecord({
            agentId:    agentId,
            asset:      asset,
            amount:     amount,
            isBuy:      isBuy,
            executedAt: uint64(block.timestamp),
            txRef:      txRef
        }));

        Agent storage a = _agents[agentId];
        a.lastExecutedAt  = uint64(block.timestamp);
        a.totalExecutions += 1;

        emit OrderExecuted(agentId, asset, amount, isBuy, execIndex);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    function getAgent(uint256 agentId)
        external
        view
        agentExists(agentId)
        returns (Agent memory)
    {
        return _agents[agentId];
    }

    /**
     * @notice Paginated execution history — prevents unbounded array returns.
     * @param agentId  The agent to query.
     * @param offset   Start index (0-based).
     * @param limit    Maximum records to return (capped at 100).
     * @return page    Slice of execution records.
     * @return total   Total number of executions for this agent.
     */
    function getExecutions(
        uint256 agentId,
        uint256 offset,
        uint256 limit
    )
        external
        view
        agentExists(agentId)
        returns (ExecutionRecord[] memory page, uint256 total)
    {
        ExecutionRecord[] storage all = _executions[agentId];
        total = all.length;

        if (offset >= total || limit == 0) {
            return (new ExecutionRecord[](0), total);
        }

        uint256 cap   = limit > 100 ? 100 : limit;
        uint256 end   = offset + cap > total ? total : offset + cap;
        uint256 count = end - offset;

        page = new ExecutionRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            page[i] = all[offset + i];
        }
    }

    function getExecutionCount(uint256 agentId)
        external
        view
        agentExists(agentId)
        returns (uint256)
    {
        return _executions[agentId].length;
    }

    function getOwnerAgents(address owner) external view returns (uint256[] memory) {
        return _ownerAgents[owner];
    }
}
