import { run } from "hardhat";

const MOCK_USD   = "0x61806e0D29b0aa200dC26e9C1F0380707a3210c9";
const MOCK_WETH  = "0x535DC64B3eBDf3ce0ed1C03a8dfbEaf3A84e49EF";
const SWAP_POOL  = "0x3440d742bbbAe391b95E40FAF62d7a715582a4ad";

async function main() {
  console.log("Verifying mUSD…");
  await run("verify:verify", {
    address: MOCK_USD,
    constructorArguments: ["Mantle Mock USD", "mUSD", 6, "1000000000000"],
  });

  console.log("Verifying mWETH…");
  await run("verify:verify", {
    address: MOCK_WETH,
    constructorArguments: ["Mantle Mock ETH", "mWETH", 18, "1000000000000000000000"],
  });

  console.log("Verifying MockSwapPool…");
  await run("verify:verify", {
    address: SWAP_POOL,
    constructorArguments: [MOCK_USD, MOCK_WETH],
  });

  console.log("All contracts verified ✓");
}

main().catch((err) => { console.error(err); process.exit(1); });
