import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { MockERC20, MockSwapPool } from '../typechain-types'

describe('MockSwapPool', () => {
  let usd: MockERC20
  let weth: MockERC20
  let pool: MockSwapPool
  let owner: any
  let trader: any

  const USD_LIQUIDITY  = ethers.parseUnits('500000', 6)   // 500,000 mUSD
  const WETH_LIQUIDITY = ethers.parseUnits('200', 18)     // 200 mWETH (~2,500 USD/ETH)

  beforeEach(async () => {
    ;[owner, trader] = await ethers.getSigners()

    const ERC20Factory = await ethers.getContractFactory('MockERC20')
    usd  = (await ERC20Factory.deploy('Mantle Mock USD', 'mUSD', 6, ethers.parseUnits('1000000', 6))) as unknown as MockERC20
    weth = (await ERC20Factory.deploy('Mantle Mock ETH', 'mWETH', 18, ethers.parseUnits('1000', 18))) as unknown as MockERC20
    await usd.waitForDeployment()
    await weth.waitForDeployment()

    const PoolFactory = await ethers.getContractFactory('MockSwapPool')
    pool = (await PoolFactory.deploy(await usd.getAddress(), await weth.getAddress())) as unknown as MockSwapPool
    await pool.waitForDeployment()

    await usd.approve(await pool.getAddress(), USD_LIQUIDITY)
    await weth.approve(await pool.getAddress(), WETH_LIQUIDITY)
    await pool.addLiquidity(USD_LIQUIDITY, WETH_LIQUIDITY)

    // Fund trader with mUSD and mWETH so it can swap
    await usd.transfer(trader.address, ethers.parseUnits('10000', 6))
    await weth.transfer(trader.address, ethers.parseUnits('10', 18))
  })

  it('seeds reserves correctly', async () => {
    const [resA, resB] = await pool.getReserves()
    expect(resA).to.equal(USD_LIQUIDITY)
    expect(resB).to.equal(WETH_LIQUIDITY)
  })

  it('quotes a smaller output than the naive spot price (fee + slippage)', async () => {
    const amountIn = ethers.parseUnits('1000', 6) // 1,000 mUSD
    const out = await pool.getAmountOut(await usd.getAddress(), amountIn)
    // Naive spot price: 1000 USD / 2500 USD-per-ETH = 0.4 ETH
    const naive = ethers.parseUnits('0.4', 18)
    expect(out).to.be.lt(naive)
    expect(out).to.be.gt(0n)
  })

  it('swaps mUSD for mWETH and updates reserves', async () => {
    const amountIn = ethers.parseUnits('1000', 6)
    const expectedOut = await pool.getAmountOut(await usd.getAddress(), amountIn)

    await usd.connect(trader).approve(await pool.getAddress(), amountIn)
    const before = await weth.balanceOf(trader.address)

    await expect(pool.connect(trader).swap(await usd.getAddress(), amountIn, expectedOut))
      .to.emit(pool, 'Swap')
      .withArgs(trader.address, await usd.getAddress(), amountIn, await weth.getAddress(), expectedOut)

    const after = await weth.balanceOf(trader.address)
    expect(after - before).to.equal(expectedOut)

    const [resA, resB] = await pool.getReserves()
    expect(resA).to.equal(USD_LIQUIDITY + amountIn)
    expect(resB).to.equal(WETH_LIQUIDITY - expectedOut)
  })

  it('swaps mWETH for mUSD (reverse direction)', async () => {
    const amountIn = ethers.parseUnits('1', 18)
    const expectedOut = await pool.getAmountOut(await weth.getAddress(), amountIn)

    await weth.connect(trader).approve(await pool.getAddress(), amountIn)
    await pool.connect(trader).swap(await weth.getAddress(), amountIn, expectedOut)

    const [resA, resB] = await pool.getReserves()
    expect(resA).to.equal(USD_LIQUIDITY - expectedOut)
    expect(resB).to.equal(WETH_LIQUIDITY + amountIn)
  })

  it('reverts on excessive slippage protection', async () => {
    const amountIn = ethers.parseUnits('1000', 6)
    const expectedOut = await pool.getAmountOut(await usd.getAddress(), amountIn)

    await usd.connect(trader).approve(await pool.getAddress(), amountIn)
    await expect(
      pool.connect(trader).swap(await usd.getAddress(), amountIn, expectedOut + 1n)
    ).to.be.revertedWith('MockSwapPool: slippage')
  })

  it('reverts on invalid token', async () => {
    await expect(
      pool.getAmountOut(owner.address, ethers.parseUnits('1', 18))
    ).to.be.revertedWith('MockSwapPool: invalid token')
  })
})
