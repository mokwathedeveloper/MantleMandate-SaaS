import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { RiskGuard } from '../typechain-types'

describe('RiskGuard', () => {
  let guard: RiskGuard
  let owner: any
  let other: any

  const AGENT_ID      = 1n
  const CAPITAL       = 100_000n  // e.g. 100,000 USDC (6-decimal units)
  const BASE_PARAMS = {
    maxDrawdownBps:  1_000n,   // 10%
    maxPositionBps:    500n,   // 5%
    stopLossBps:       300n,   // 3%
    maxPositions:        5n,
    cooldownSeconds:     0n,   // no cooldown in unit tests
  }

  beforeEach(async () => {
    ;[owner, other] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('RiskGuard')
    guard = (await Factory.deploy()) as unknown as RiskGuard
    await guard.waitForDeployment()
  })

  // ── setRiskParams ──────────────────────────────────────────────────────────

  describe('setRiskParams', () => {
    it('initialises params and emits event', async () => {
      await expect(guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL))
        .to.emit(guard, 'RiskParamsSet')
        .withArgs(AGENT_ID, Object.values(BASE_PARAMS))
      expect(await guard.isInitialized(AGENT_ID)).to.be.true
    })

    it('stores params correctly', async () => {
      await guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL)
      const p = await guard.getRiskParams(AGENT_ID)
      expect(p.maxDrawdownBps).to.equal(BASE_PARAMS.maxDrawdownBps)
      expect(p.maxPositions).to.equal(BASE_PARAMS.maxPositions)
    })

    it('reverts if maxDrawdownBps > 10000', async () => {
      await expect(
        guard.connect(owner).setRiskParams(AGENT_ID, { ...BASE_PARAMS, maxDrawdownBps: 10_001n }, CAPITAL)
      ).to.be.revertedWith('RiskGuard: drawdown > 100%')
    })

    it('reverts if maxPositions is zero', async () => {
      await expect(
        guard.connect(owner).setRiskParams(AGENT_ID, { ...BASE_PARAMS, maxPositions: 0n }, CAPITAL)
      ).to.be.revertedWith('RiskGuard: zero max positions')
    })

    it('reverts on zero initial capital', async () => {
      await expect(
        guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, 0n)
      ).to.be.revertedWith('RiskGuard: zero capital')
    })
  })

  // ── checkOrder ─────────────────────────────────────────────────────────────

  describe('checkOrder', () => {
    beforeEach(async () => {
      await guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL)
    })

    it('accepts a valid order and emits PositionOpened', async () => {
      const orderValue = 4_000n  // 4% of 100,000 < 5% max
      await expect(guard.connect(owner).checkOrder(AGENT_ID, orderValue, CAPITAL))
        .to.emit(guard, 'PositionOpened')
        .withArgs(AGENT_ID, 1n)
    })

    it('increments openPositions', async () => {
      await guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL)
      await guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL)
      const [openPositions] = await guard.getRiskState(AGENT_ID)
      expect(openPositions).to.equal(2n)
    })

    it('reverts when position too large', async () => {
      const orderValue = 6_000n  // 6% > 5% max
      await expect(guard.connect(owner).checkOrder(AGENT_ID, orderValue, CAPITAL))
        .to.be.revertedWith('RiskGuard: position too large')
    })

    it('reverts when max positions reached', async () => {
      for (let i = 0; i < 5; i++) {
        await guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL)
      }
      await expect(guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL))
        .to.be.revertedWith('RiskGuard: max positions reached')
    })

    it('reverts on uninitialized agent', async () => {
      await expect(guard.connect(owner).checkOrder(999n, 1_000n, CAPITAL))
        .to.be.revertedWith('RiskGuard: not initialized')
    })

    it('reverts when drawdown exceeded', async () => {
      // Close with a 15% loss — breach 10% maxDrawdown
      await guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL)
      await guard.connect(owner).closePosition(AGENT_ID, 15_000n, false)  // –15%

      await expect(guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL))
        .to.be.revertedWith('RiskGuard: drawdown exceeded')
    })

    it('enforces cooldown between trades', async () => {
      const paramsWithCooldown = { ...BASE_PARAMS, cooldownSeconds: 3600n }
      const AGENT2 = 2n
      await guard.connect(owner).setRiskParams(AGENT2, paramsWithCooldown, CAPITAL)

      await guard.connect(owner).checkOrder(AGENT2, 1_000n, CAPITAL)
      await expect(guard.connect(owner).checkOrder(AGENT2, 1_000n, CAPITAL))
        .to.be.revertedWith('RiskGuard: cooldown active')
    })
  })

  // ── closePosition ──────────────────────────────────────────────────────────

  describe('closePosition', () => {
    beforeEach(async () => {
      await guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL)
      await guard.connect(owner).checkOrder(AGENT_ID, 5_000n, CAPITAL)  // open 1 position
    })

    it('closes position and updates capital on profit', async () => {
      await expect(guard.connect(owner).closePosition(AGENT_ID, 2_000n, true))
        .to.emit(guard, 'PositionClosed')
        .withArgs(AGENT_ID, 0n, CAPITAL + 2_000n)

      const [, , currentCapital] = await guard.getRiskState(AGENT_ID)
      expect(currentCapital).to.equal(CAPITAL + 2_000n)
    })

    it('closes position and decrements capital on loss', async () => {
      await guard.connect(owner).closePosition(AGENT_ID, 5_000n, false)
      const [, , currentCapital] = await guard.getRiskState(AGENT_ID)
      expect(currentCapital).to.equal(CAPITAL - 5_000n)
    })

    it('floors capital at zero on total loss', async () => {
      await guard.connect(owner).closePosition(AGENT_ID, CAPITAL * 2n, false)
      const [, , currentCapital] = await guard.getRiskState(AGENT_ID)
      expect(currentCapital).to.equal(0n)
    })

    it('updates peak capital on profit', async () => {
      await guard.connect(owner).closePosition(AGENT_ID, 10_000n, true)
      const [, peakCapital] = await guard.getRiskState(AGENT_ID)
      expect(peakCapital).to.equal(CAPITAL + 10_000n)
    })

    it('reverts when no open positions', async () => {
      await guard.connect(owner).closePosition(AGENT_ID, 1_000n, true)
      await expect(guard.connect(owner).closePosition(AGENT_ID, 1_000n, true))
        .to.be.revertedWith('RiskGuard: no open positions')
    })

    it('reverts for non-owner', async () => {
      await expect(guard.connect(other).closePosition(AGENT_ID, 1_000n, true))
        .to.be.revertedWith('RiskGuard: not owner')
    })
  })

  // ── read helpers ───────────────────────────────────────────────────────────

  describe('read functions', () => {
    it('isInitialized returns false before setRiskParams', async () => {
      expect(await guard.isInitialized(42n)).to.be.false
    })

    it('currentDrawdownBps is 0 at start', async () => {
      await guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL)
      expect(await guard.currentDrawdownBps(AGENT_ID)).to.equal(0n)
    })

    it('currentDrawdownBps reflects loss', async () => {
      await guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL)
      await guard.connect(owner).checkOrder(AGENT_ID, 1_000n, CAPITAL)
      await guard.connect(owner).closePosition(AGENT_ID, 10_000n, false)  // 10% loss

      const bps = await guard.currentDrawdownBps(AGENT_ID)
      expect(bps).to.equal(1_000n)  // exactly 10%
    })

    it('updateCapital raises peak on deposit', async () => {
      await guard.connect(owner).setRiskParams(AGENT_ID, BASE_PARAMS, CAPITAL)
      await guard.connect(owner).updateCapital(AGENT_ID, CAPITAL * 2n)
      const [, peakCapital, currentCapital] = await guard.getRiskState(AGENT_ID)
      expect(peakCapital).to.equal(CAPITAL * 2n)
      expect(currentCapital).to.equal(CAPITAL * 2n)
    })
  })
})
