import { run } from "hardhat";

const MANDATE_POLICY  = "0xee9FBcb6583B32d0ddC615882d0A03DA8714b952";
const AGENT_EXECUTOR  = "0xEa15a627e1EADf5c3D09b641295CFD037BaaA4B7";
const RISK_GUARD      = "0x5d7E824D8A374aA2b8ACe225220Ad7246a81e258";

async function main() {
  console.log("Verifying MandatePolicy…");
  await run("verify:verify", {
    address: MANDATE_POLICY,
    constructorArguments: [],
  });

  console.log("Verifying AgentExecutor…");
  await run("verify:verify", {
    address: AGENT_EXECUTOR,
    constructorArguments: [],
  });

  console.log("Verifying RiskGuard…");
  await run("verify:verify", {
    address: RISK_GUARD,
    constructorArguments: [],
  });

  console.log("All contracts verified ✓");
}

main().catch((err) => { console.error(err); process.exit(1); });
