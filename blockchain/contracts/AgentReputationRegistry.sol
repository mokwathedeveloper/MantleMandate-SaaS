// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentExecutor.sol";

/**
 * @title AgentReputationRegistry
 * @notice On-chain pre-execution commitment trail and reputation tracking for
 *         MantleMandate AI agents. An agent owner commits a hash of the AI's
 *         reasoning *before* a trade executes, then resolves it afterwards
 *         with the real outcome. This makes the agent's decision history
 *         tamper-evident and lets reputation be derived from immutable,
 *         contract-enforced records rather than off-chain claims.
 *
 *         Ownership is verified by reading the existing, deployed
 *         AgentExecutor contract — this contract is purely additive and
 *         does not modify or redeploy AgentExecutor, MandatePolicy or
 *         RiskGuard.
 *
 * Deployed on Mantle Network (chainId 5000 / testnet 5003).
 */
contract AgentReputationRegistry {

    // ── Types ────────────────────────────────────────────────────────────────

    struct Commitment {
        uint256 agentId;
        bytes32 reasoningHash;  // hash of the off-chain reasoning payload (e.g. IPFS CID digest)
        uint64  committedAt;
        bool    resolved;
        bool    executed;
        uint64  resolvedAt;
    }

    // ── Storage ──────────────────────────────────────────────────────────────

    AgentExecutor public immutable agentExecutor;

    mapping(uint256 => Commitment[]) private _commitments;
    mapping(uint256 => uint256)      private _totalExecuted;
    mapping(uint256 => uint256)      private _totalResolved;

    // ── Events ───────────────────────────────────────────────────────────────

    event DecisionCommitted(
        uint256 indexed agentId,
        uint256 indexed commitIndex,
        bytes32         reasoningHash
    );

    event CommitmentResolved(
        uint256 indexed agentId,
        uint256 indexed commitIndex,
        bool            executed
    );

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAgentOwner(uint256 agentId) {
        require(
            agentExecutor.getAgent(agentId).owner == msg.sender,
            "AgentReputationRegistry: not owner"
        );
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(address agentExecutorAddress) {
        require(agentExecutorAddress != address(0), "AgentReputationRegistry: zero address");
        agentExecutor = AgentExecutor(agentExecutorAddress);
    }

    // ── Write ────────────────────────────────────────────────────────────────

    /**
     * @notice Commit a hash of the AI's reasoning for a decision before it executes.
     * @param agentId        The agent making the decision (must be owned by caller).
     * @param reasoningHash  keccak256 (or other) hash of the off-chain reasoning payload.
     * @return commitIndex   Index of the new commitment for this agent.
     */
    function commitDecision(uint256 agentId, bytes32 reasoningHash)
        external
        onlyAgentOwner(agentId)
        returns (uint256 commitIndex)
    {
        require(reasoningHash != bytes32(0), "AgentReputationRegistry: zero hash");

        commitIndex = _commitments[agentId].length;
        _commitments[agentId].push(Commitment({
            agentId:       agentId,
            reasoningHash: reasoningHash,
            committedAt:   uint64(block.timestamp),
            resolved:      false,
            executed:      false,
            resolvedAt:    0
        }));

        emit DecisionCommitted(agentId, commitIndex, reasoningHash);
    }

    /**
     * @notice Resolve a prior commitment with the real outcome.
     * @param agentId      The agent that made the commitment.
     * @param commitIndex  Index returned by commitDecision.
     * @param executed     True if the committed decision was actually executed on-chain.
     */
    function resolveCommitment(uint256 agentId, uint256 commitIndex, bool executed)
        external
        onlyAgentOwner(agentId)
    {
        require(commitIndex < _commitments[agentId].length, "AgentReputationRegistry: not found");

        Commitment storage c = _commitments[agentId][commitIndex];
        require(!c.resolved, "AgentReputationRegistry: already resolved");

        c.resolved   = true;
        c.executed   = executed;
        c.resolvedAt = uint64(block.timestamp);

        _totalResolved[agentId] += 1;
        if (executed) {
            _totalExecuted[agentId] += 1;
        }

        emit CommitmentResolved(agentId, commitIndex, executed);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * @notice Aggregate reputation counters for an agent.
     * @return totalCommitted  Total number of commitments ever made.
     * @return totalExecuted   Number of resolved commitments where executed == true.
     * @return totalResolved   Number of commitments that have been resolved.
     */
    function getReputation(uint256 agentId)
        external
        view
        returns (uint256 totalCommitted, uint256 totalExecuted, uint256 totalResolved)
    {
        totalCommitted = _commitments[agentId].length;
        totalExecuted  = _totalExecuted[agentId];
        totalResolved  = _totalResolved[agentId];
    }

    /**
     * @notice Paginated commitment history — prevents unbounded array returns.
     * @param agentId  The agent to query.
     * @param offset   Start index (0-based).
     * @param limit    Maximum records to return (capped at 100).
     * @return page    Slice of commitment records.
     * @return total   Total number of commitments for this agent.
     */
    function getCommitments(
        uint256 agentId,
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (Commitment[] memory page, uint256 total)
    {
        Commitment[] storage all = _commitments[agentId];
        total = all.length;

        if (offset >= total || limit == 0) {
            return (new Commitment[](0), total);
        }

        uint256 cap   = limit > 100 ? 100 : limit;
        uint256 end   = offset + cap > total ? total : offset + cap;
        uint256 count = end - offset;

        page = new Commitment[](count);
        for (uint256 i = 0; i < count; i++) {
            page[i] = all[offset + i];
        }
    }

    function getCommitmentCount(uint256 agentId) external view returns (uint256) {
        return _commitments[agentId].length;
    }
}
