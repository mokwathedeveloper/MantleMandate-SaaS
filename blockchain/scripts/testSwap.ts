import { ethers, network } from 'hardhat'

// Exercises the same on-chain path as frontend/lib/agentTick.ts's trySwap():
// quote via getAmountOut, then swap mUSD -> mWETH on the live MockSwapPool,
// using the service wallet (deployer) which already holds approved balances.
async function main() {
  const [signer] = await ethers.getSigners()
  console.log(`Network:  ${network.name}`)
  console.log(`Signer:   ${signer.address}`)

  const USD_ADDRESS  = '0x61806e0D29b0aa200dC26e9C1F0380707a3210c9'
  const WETH_ADDRESS = '0x535DC64B3eBDf3ce0ed1C03a8dfbEaf3A84e49EF'
  const POOL_ADDRESS = '0x3440d742bbbAe391b95E40FAF62d7a715582a4ad'

  const usd  = await ethers.getContractAt('MockERC20', USD_ADDRESS)
  const weth = await ethers.getContractAt('MockERC20', WETH_ADDRESS)
  const pool = await ethers.getContractAt('MockSwapPool', POOL_ADDRESS)

  const [resBefore0, resBefore1] = await pool.getReserves()
  console.log(`\nReserves before: ${ethers.formatUnits(resBefore0, 6)} mUSD / ${ethers.formatUnits(resBefore1, 18)} mWETH`)

  const amountIn = ethers.parseUnits('25', 6) // simulate a $25 buy, like a small agent tick
  const expectedOut = await pool.getAmountOut(USD_ADDRESS, amountIn)
  console.log(`Quote: ${ethers.formatUnits(amountIn, 6)} mUSD -> ${ethers.formatUnits(expectedOut, 18)} mWETH`)

  const minAmountOut = (expectedOut * 99n) / 100n // 1% slippage tolerance, same as trySwap()

  const wethBefore = await weth.balanceOf(signer.address)
  const tx = await pool.swap(USD_ADDRESS, amountIn, minAmountOut)
  const receipt = await tx.wait()
  console.log(`\n✅ Swap tx: ${receipt!.hash}`)
  console.log(`   Explorer: https://explorer.sepolia.mantle.xyz/tx/${receipt!.hash}`)

  const wethAfter = await weth.balanceOf(signer.address)
  console.log(`\nmWETH received: ${ethers.formatUnits(wethAfter - wethBefore, 18)}`)

  const [resAfter0, resAfter1] = await pool.getReserves()
  console.log(`Reserves after:  ${ethers.formatUnits(resAfter0, 6)} mUSD / ${ethers.formatUnits(resAfter1, 18)} mWETH`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
