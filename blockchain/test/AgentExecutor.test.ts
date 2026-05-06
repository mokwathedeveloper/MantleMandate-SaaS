import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { MandatePolicy, AgentExecutor } from '../typechain-types'

describe('AgentExecutor', () => {
  let policy: MandatePolicy
  let executor: AgentExecutor
  let owner: any
  let other: any

  const POLICY_HASH = ethers.keccak256(ethers.toUtf8Bytes('test-policy'))
  const ASSET_ETH   = ethers.keccak256(ethers.toUtf8Bytes('ETH'))
  const TX_REF      = ethers.keccak256(ethers.toUtf8Bytes('order-001'))

  beforeEach(async () => {
    ;[owner, other] = await ethers.getSigners()

    const PolicyFactory = await ethers.getContractFactory('MandatePolicy')
    policy = (await PolicyFactory.deploy()) as unknown as MandatePolicy
    await policy.waitForDeployment()

    const ExecFactory = await ethers.getContractFactory('AgentExecutor')
    executor = (await ExecFactory.deploy()) as unknown as AgentExecutor
    await executor.waitForDeployment()

    // Register a policy so owner has a verified hash
    await policy.connect(owner).submitPolicy(POLICY_HASH)
  })

  // ── registerAgent ──────────────────────────────────────────────────────────

  describe('registerAgent', () => {
    it('registers agent and emits event', async () => {
      const tx = executor.connect(owner).registerAgent(POLICY_HASH, await policy.getAddress())
      await expect(tx)
        .to.emit(executor, 'AgentRegistered')
        .withArgs(owner.address, 0n, POLICY_HASH)
    })

    it('returns incrementing agent IDs', async () => {
      await executor.connect(owner).registerAgent(POLICY_HASH, await policy.getAddress())

      const HASH_B = ethers.keccak256(ethers.toUtf8Bytes('policy-b'))
      await policy.connect(other).submitPolicy(HASH_B)
      await executor.connect(other).registerAgent(HASH_B, await policy.getAddress())

      const ownerAgents = await executor.getOwnerAgents(owner.address)
      const otherAgents = await executor.getOwnerAgents(other.address)
      expect(ownerAgents[0]).to.equal(0n)
      expect(otherAgents[0]).to.equal(1n)
    })

    it('reverts on zero hash', async () => {
      await expect(
        executor.connect(owner).registerAgent(ethers.ZeroHash, await policy.getAddress())
      ).to.be.revertedWith('AgentExecutor: zero hash')
    })

    it('reverts on zero address', async () => {
      await expect(
        executor.connect(owner).registerAgent(POLICY_HASH, ethers.ZeroAddress)
      ).to.be.revertedWith('AgentExecutor: zero address')
    })

    it('reverts if policy not verified', async () => {
      const unregisteredHash = ethers.keccak256(ethers.toUtf8Bytes('not-on-chain'))
      await expect(
        executor.connect(owner).registerAgent(unregisteredHash, await policy.getAddress())
      ).to.be.revertedWith('AgentExecutor: policy not verified')
    })
  })

  // ── lifecycle ──────────────────────────────────────────────────────────────

  describe('lifecycle', () => {
    let agentId: bigint

    beforeEach(async () => {
      const tx = await executor.connect(owner).registerAgent(POLICY_HASH, await policy.getAddress())
      const receipt = await tx.wait()
      agentId = 0n
    })

    it('activates an Inactive agent', async () => {
      await expect(executor.connect(owner).activateAgent(agentId))
        .to.emit(executor, 'AgentStatusChanged')
        .withArgs(agentId, 1n) // Active = 1
    })

    it('pauses an Active agent', async () => {
      await executor.connect(owner).activateAgent(agentId)
      await expect(executor.connect(owner).pauseAgent(agentId))
        .to.emit(executor, 'AgentStatusChanged')
        .withArgs(agentId, 2n) // Paused = 2
    })

    it('resumes a Paused agent', async () => {
      await executor.connect(owner).activateAgent(agentId)
      await executor.connect(owner).pauseAgent(agentId)
      await expect(executor.connect(owner).resumeAgent(agentId))
        .to.emit(executor, 'AgentStatusChanged')
        .withArgs(agentId, 1n) // Active = 1
    })

    it('stops an Active agent', async () => {
      await executor.connect(owner).activateAgent(agentId)
      await expect(executor.connect(owner).stopAgent(agentId))
        .to.emit(executor, 'AgentStatusChanged')
        .withArgs(agentId, 3n) // Stopped = 3
    })

    it('reverts pause on Inactive agent', async () => {
      await expect(executor.connect(owner).pauseAgent(agentId))
        .to.be.revertedWith('AgentExecutor: not active')
    })

    it('reverts resume on Active agent', async () => {
      await executor.connect(owner).activateAgent(agentId)
      await expect(executor.connect(owner).resumeAgent(agentId))
        .to.be.revertedWith('AgentExecutor: not paused')
    })

    it('reverts double-stop', async () => {
      await executor.connect(owner).activateAgent(agentId)
      await executor.connect(owner).stopAgent(agentId)
      await expect(executor.connect(owner).stopAgent(agentId))
        .to.be.revertedWith('AgentExecutor: already stopped')
    })

    it('non-owner cannot change status', async () => {
      await expect(executor.connect(other).activateAgent(agentId))
        .to.be.revertedWith('AgentExecutor: not owner')
    })
  })

  // ── executeOrder ───────────────────────────────────────────────────────────

  describe('executeOrder', () => {
    let agentId: bigint

    beforeEach(async () => {
      await executor.connect(owner).registerAgent(POLICY_HASH, await policy.getAddress())
      agentId = 0n
      await executor.connect(owner).activateAgent(agentId)
    })

    it('records an execution and emits event', async () => {
      await expect(
        executor.connect(owner).executeOrder(agentId, ASSET_ETH, 1_000_000n, true, TX_REF)
      )
        .to.emit(executor, 'OrderExecuted')
        .withArgs(agentId, ASSET_ETH, 1_000_000n, true, 0n)

      const count = await executor.getExecutionCount(agentId)
      expect(count).to.equal(1n)
    })

    it('increments totalExecutions on the agent', async () => {
      await executor.connect(owner).executeOrder(agentId, ASSET_ETH, 500_000n, false, TX_REF)
      await executor.connect(owner).executeOrder(agentId, ASSET_ETH, 750_000n, true, TX_REF)
      const agent = await executor.getAgent(agentId)
      expect(agent.totalExecutions).to.equal(2n)
    })

    it('reverts on zero amount', async () => {
      await expect(
        executor.connect(owner).executeOrder(agentId, ASSET_ETH, 0n, true, TX_REF)
      ).to.be.revertedWith('AgentExecutor: zero amount')
    })

    it('reverts when agent is not active', async () => {
      await executor.connect(owner).pauseAgent(agentId)
      await expect(
        executor.connect(owner).executeOrder(agentId, ASSET_ETH, 1_000_000n, true, TX_REF)
      ).to.be.revertedWith('AgentExecutor: agent not active')
    })

    it('reverts for non-owner', async () => {
      await expect(
        executor.connect(other).executeOrder(agentId, ASSET_ETH, 1_000_000n, true, TX_REF)
      ).to.be.revertedWith('AgentExecutor: not owner')
    })
  })

  // ── read ───────────────────────────────────────────────────────────────────

  describe('read functions', () => {
    it('getAgent reverts for non-existent ID', async () => {
      await expect(executor.getAgent(999n))
        .to.be.revertedWith('AgentExecutor: not found')
    })

    it('getOwnerAgents returns empty array for new address', async () => {
      const agents = await executor.getOwnerAgents(other.address)
      expect(agents).to.have.lengthOf(0)
    })

    it('getExecutions returns all records in order', async () => {
      await executor.connect(owner).registerAgent(POLICY_HASH, await policy.getAddress())
      const agentId = 0n
      await executor.connect(owner).activateAgent(agentId)

      const REF_A = ethers.keccak256(ethers.toUtf8Bytes('order-a'))
      const REF_B = ethers.keccak256(ethers.toUtf8Bytes('order-b'))
      await executor.connect(owner).executeOrder(agentId, ASSET_ETH, 100n, true,  REF_A)
      await executor.connect(owner).executeOrder(agentId, ASSET_ETH, 200n, false, REF_B)

      const execs = await executor.getExecutions(agentId)
      expect(execs).to.have.lengthOf(2)
      expect(execs[0].amount).to.equal(100n)
      expect(execs[1].isBuy).to.be.false
    })
  })
})
