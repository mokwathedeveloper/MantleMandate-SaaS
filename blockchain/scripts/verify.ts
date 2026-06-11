import { run } from "hardhat";

const MANDATE_POLICY  = "0x690Ab021b40a01E9f3818CdBa149fb5721480871";
const AGENT_EXECUTOR  = "0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6";
const RISK_GUARD      = "0x8D99D4F922248852Bc678bd4018F9f3E4576E34B";

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
