// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MandatePolicy
 * @notice On-chain registry for MantleMandate AI trading policy hashes.
 *         Each user submits the SHA-256 hash of their parsed policy.
 *         The hash proves the mandate was immutable at deployment time.
 *
 * Deployed on Mantle Network (chainId 5000 / testnet 5003).
 */
contract MandatePolicy {
    struct Policy {
        bytes32 hash;
        address owner;
        uint64  timestamp;
        bool    active;
    }

    // owner → list of submitted policies
    mapping(address => Policy[]) private _policies;

    // Global lookup: hash → owner (O(1) ownership check)
    mapping(bytes32 => address) public policyOwner;

    // hash → index in _policies[owner] — eliminates unbounded loops
    mapping(bytes32 => uint256) private _policyIndex;

    event PolicySubmitted(
        address indexed owner,
        bytes32 indexed policyHash,
        uint256 indexed policyIndex,
        uint64  timestamp
    );

    event PolicyRevoked(
        address indexed owner,
        bytes32 indexed policyHash
    );

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Register a policy hash on-chain.
     * @param policyHash  SHA-256 of the canonical policy JSON (32 bytes).
     */
    function submitPolicy(bytes32 policyHash) external {
        require(policyHash != bytes32(0), "MandatePolicy: zero hash");
        require(policyOwner[policyHash] == address(0), "MandatePolicy: already registered");

        uint256 idx = _policies[msg.sender].length;
        _policies[msg.sender].push(Policy({
            hash:      policyHash,
            owner:     msg.sender,
            timestamp: uint64(block.timestamp),
            active:    true
        }));
        policyOwner[policyHash]  = msg.sender;
        _policyIndex[policyHash] = idx;

        emit PolicySubmitted(msg.sender, policyHash, idx, uint64(block.timestamp));
    }

    /**
     * @notice Revoke (deactivate) a policy — does NOT delete on-chain history.
     *         O(1): uses the stored index instead of a loop.
     * @param policyHash  The hash to revoke.
     */
    function revokePolicy(bytes32 policyHash) external {
        require(policyOwner[policyHash] == msg.sender, "MandatePolicy: not owner");

        uint256 idx = _policyIndex[policyHash];
        Policy storage p = _policies[msg.sender][idx];
        require(p.hash == policyHash, "MandatePolicy: index mismatch");
        require(p.active, "MandatePolicy: already revoked");

        p.active = false;
        emit PolicyRevoked(msg.sender, policyHash);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * @notice Verify that a hash is registered and still active.
     *         O(1): direct index lookup, no loop.
     */
    function verifyPolicy(address owner, bytes32 policyHash) external view returns (bool) {
        if (policyOwner[policyHash] != owner) return false;
        uint256 idx = _policyIndex[policyHash];
        Policy storage p = _policies[owner][idx];
        return p.hash == policyHash && p.active;
    }

    /**
     * @notice Return all policies ever submitted by an address.
     */
    function getPolicies(address owner) external view returns (Policy[] memory) {
        return _policies[owner];
    }

    /**
     * @notice Return the total number of policies submitted by an address.
     */
    function getPolicyCount(address owner) external view returns (uint256) {
        return _policies[owner].length;
    }
}
