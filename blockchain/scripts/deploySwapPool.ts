import { ethers, network } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying MockSwapPool stack on ${network.name}`)
  console.log(`Deployer: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log(`Balance:  ${ethers.formatEther(balance)} MNT\n`)

  const USD_SUPPLY  = ethers.parseUnits('1000000', 6)   // 1,000,000 mUSD
  const WETH_SUPPLY = ethers.parseUnits('1000', 18)     // 1,000 mWETH

  const USD_LIQUIDITY  = ethers.parseUnits('500000', 6) // 500,000 mUSD
  const WETH_LIQUIDITY = ethers.parseUnits('200', 18)   // 200 mWETH (~2,500 USD/ETH)

  // ── Mock tokens ──────────────────────────────────────────────────────────
  const ERC20Factory = await ethers.getContractFactory('MockERC20')

  const usd = await ERC20Factory.deploy('Mantle Mock USD', 'mUSD', 6, USD_SUPPLY)
  await usd.waitForDeployment()
  const usdAddress = await usd.getAddress()
  console.log(`✅ mUSD          deployed to: ${usdAddress}`)

  const weth = await ERC20Factory.deploy('Mantle Mock ETH', 'mWETH', 18, WETH_SUPPLY)
  await weth.waitForDeployment()
  const wethAddress = await weth.getAddress()
  console.log(`✅ mWETH         deployed to: ${wethAddress}`)

  // ── Swap pool ────────────────────────────────────────────────────────────
  const PoolFactory = await ethers.getContractFactory('MockSwapPool')
  const pool = await PoolFactory.deploy(usdAddress, wethAddress)
  await pool.waitForDeployment()
  const poolAddress = await pool.getAddress()
  console.log(`✅ MockSwapPool  deployed to: ${poolAddress}`)

  // ── Seed liquidity ───────────────────────────────────────────────────────
  console.log('\nSeeding liquidity (500,000 mUSD / 200 mWETH)…')
  await (await usd.approve(poolAddress, USD_LIQUIDITY)).wait()
  await (await weth.approve(poolAddress, WETH_LIQUIDITY)).wait()
  await (await pool.addLiquidity(USD_LIQUIDITY, WETH_LIQUIDITY)).wait()
  console.log('✅ Liquidity seeded')

  // ── Pre-approve the pool to spend the deployer's (= service wallet's)
  //    remaining balances, so the agent can swap without an extra approve tx ──
  console.log('\nApproving pool for service wallet trading balances…')
  await (await usd.approve(poolAddress, ethers.MaxUint256)).wait()
  await (await weth.approve(poolAddress, ethers.MaxUint256)).wait()
  console.log('✅ Approvals set')

  console.log('\n─────────────────────────────────────────────────────────────')
  console.log('Add these to frontend/.env.local and Vercel:')
  console.log(`NEXT_PUBLIC_MOCK_USD_CONTRACT=${usdAddress}`)
  console.log(`NEXT_PUBLIC_MOCK_WETH_CONTRACT=${wethAddress}`)
  console.log(`NEXT_PUBLIC_SWAP_POOL_CONTRACT=${poolAddress}`)
  console.log('─────────────────────────────────────────────────────────────')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
