import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { MandatePolicy, AgentExecutor, AgentReputationRegistry } from '../typechain-types'

describe('AgentReputationRegistry', () => {
  let policy: MandatePolicy
  let executor: AgentExecutor
  let registry: AgentReputationRegistry
  let owner: any
  let other: any

  const POLICY_HASH    = ethers.keccak256(ethers.toUtf8Bytes('test-policy'))
  const REASONING_HASH = ethers.keccak256(ethers.toUtf8Bytes('reasoning-001'))
  const REASONING_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes('reasoning-002'))

  beforeEach(async () => {
    ;[owner, other] = await ethers.getSigners()

    const PolicyFactory = await ethers.getContractFactory('MandatePolicy')
    policy = (await PolicyFactory.deploy()) as unknown as MandatePolicy
    await policy.waitForDeployment()

    const ExecFactory = await ethers.getContractFactory('AgentExecutor')
    executor = (await ExecFactory.deploy()) as unknown as AgentExecutor
    await executor.waitForDeployment()

    const RegistryFactory = await ethers.getContractFactory('AgentReputationRegistry')
    registry = (await RegistryFactory.deploy(await executor.getAddress())) as unknown as AgentReputationRegistry
    await registry.waitForDeployment()

    // Register a policy + agent so `owner` has agentId 0
    await policy.connect(owner).submitPolicy(POLICY_HASH)
    await executor.connect(owner).registerAgent(POLICY_HASH, await policy.getAddress())
  })

  // ── constructor ─────────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('reverts on zero address', async () => {
      const RegistryFactory = await ethers.getContractFactory('AgentReputationRegistry')
      await expect(RegistryFactory.deploy(ethers.ZeroAddress))
        .to.be.revertedWith('AgentReputationRegistry: zero address')
    })

    it('stores the AgentExecutor address', async () => {
      expect(await registry.agentExecutor()).to.equal(await executor.getAddress())
    })
  })

  // ── commitDecision ─────────────────────────────────────────────────────────

  describe('commitDecision', () => {
    const agentId = 0n

    it('records a commitment and emits event', async () => {
      await expect(registry.connect(owner).commitDecision(agentId, REASONING_HASH))
        .to.emit(registry, 'DecisionCommitted')
        .withArgs(agentId, 0n, REASONING_HASH)

      const count = await registry.getCommitmentCount(agentId)
      expect(count).to.equal(1n)
    })

    it('returns incrementing commit indices', async () => {
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH)
      await expect(registry.connect(owner).commitDecision(agentId, REASONING_HASH_2))
        .to.emit(registry, 'DecisionCommitted')
        .withArgs(agentId, 1n, REASONING_HASH_2)
    })

    it('reverts on zero hash', async () => {
      await expect(registry.connect(owner).commitDecision(agentId, ethers.ZeroHash))
        .to.be.revertedWith('AgentReputationRegistry: zero hash')
    })

    it('reverts for non-owner', async () => {
      await expect(registry.connect(other).commitDecision(agentId, REASONING_HASH))
        .to.be.revertedWith('AgentReputationRegistry: not owner')
    })

    it('reverts for non-existent agent', async () => {
      await expect(registry.connect(owner).commitDecision(999n, REASONING_HASH))
        .to.be.revertedWith('AgentExecutor: not found')
    })
  })

  // ── resolveCommitment ──────────────────────────────────────────────────────

  describe('resolveCommitment', () => {
    const agentId = 0n

    beforeEach(async () => {
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH)
    })

    it('resolves as executed and emits event', async () => {
      await expect(registry.connect(owner).resolveCommitment(agentId, 0n, true))
        .to.emit(registry, 'CommitmentResolved')
        .withArgs(agentId, 0n, true)

      const [totalCommitted, totalExecuted, totalResolved] = await registry.getReputation(agentId)
      expect(totalCommitted).to.equal(1n)
      expect(totalExecuted).to.equal(1n)
      expect(totalResolved).to.equal(1n)
    })

    it('resolves as not-executed without incrementing totalExecuted', async () => {
      await registry.connect(owner).resolveCommitment(agentId, 0n, false)

      const [totalCommitted, totalExecuted, totalResolved] = await registry.getReputation(agentId)
      expect(totalCommitted).to.equal(1n)
      expect(totalExecuted).to.equal(0n)
      expect(totalResolved).to.equal(1n)
    })

    it('reverts on double-resolve', async () => {
      await registry.connect(owner).resolveCommitment(agentId, 0n, true)
      await expect(registry.connect(owner).resolveCommitment(agentId, 0n, true))
        .to.be.revertedWith('AgentReputationRegistry: already resolved')
    })

    it('reverts on out-of-range commitIndex', async () => {
      await expect(registry.connect(owner).resolveCommitment(agentId, 5n, true))
        .to.be.revertedWith('AgentReputationRegistry: not found')
    })

    it('reverts for non-owner', async () => {
      await expect(registry.connect(other).resolveCommitment(agentId, 0n, true))
        .to.be.revertedWith('AgentReputationRegistry: not owner')
    })
  })

  // ── read functions ─────────────────────────────────────────────────────────

  describe('read functions', () => {
    const agentId = 0n

    it('getReputation returns zeros for an agent with no commitments', async () => {
      const [totalCommitted, totalExecuted, totalResolved] = await registry.getReputation(agentId)
      expect(totalCommitted).to.equal(0n)
      expect(totalExecuted).to.equal(0n)
      expect(totalResolved).to.equal(0n)
    })

    it('getCommitments returns all records in order', async () => {
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH)
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH_2)
      await registry.connect(owner).resolveCommitment(agentId, 0n, true)

      const [page, total] = await registry.getCommitments(agentId, 0n, 100n)
      expect(total).to.equal(2n)
      expect(page).to.have.lengthOf(2)
      expect(page[0].reasoningHash).to.equal(REASONING_HASH)
      expect(page[0].resolved).to.be.true
      expect(page[0].executed).to.be.true
      expect(page[1].reasoningHash).to.equal(REASONING_HASH_2)
      expect(page[1].resolved).to.be.false
    })

    it('getCommitments paginates with offset/limit', async () => {
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH)
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH_2)

      const [page, total] = await registry.getCommitments(agentId, 1n, 100n)
      expect(total).to.equal(2n)
      expect(page).to.have.lengthOf(1)
      expect(page[0].reasoningHash).to.equal(REASONING_HASH_2)
    })

    it('getCommitments returns empty page when offset >= total', async () => {
      await registry.connect(owner).commitDecision(agentId, REASONING_HASH)

      const [page, total] = await registry.getCommitments(agentId, 5n, 100n)
      expect(total).to.equal(1n)
      expect(page).to.have.lengthOf(0)
    })

    it('getCommitmentCount returns 0 for an unused agent', async () => {
      expect(await registry.getCommitmentCount(agentId)).to.equal(0n)
    })
  })
})
