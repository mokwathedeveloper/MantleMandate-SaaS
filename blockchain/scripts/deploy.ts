import { ethers, network } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying MantleMandate contracts on ${network.name}`)
  console.log(`Deployer: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log(`Balance:  ${ethers.formatEther(balance)} MNT\n`)

  // ── MandatePolicy ──────────────────────────────────────────────────────────
  const PolicyFactory  = await ethers.getContractFactory('MandatePolicy')
  const mandatePolicy  = await PolicyFactory.deploy()
  await mandatePolicy.waitForDeployment()
  const policyAddress  = await mandatePolicy.getAddress()
  console.log(`✅ MandatePolicy  deployed to: ${policyAddress}`)

  // ── AgentExecutor ──────────────────────────────────────────────────────────
  const ExecutorFactory = await ethers.getContractFactory('AgentExecutor')
  const agentExecutor   = await ExecutorFactory.deploy()
  await agentExecutor.waitForDeployment()
  const executorAddress = await agentExecutor.getAddress()
  console.log(`✅ AgentExecutor  deployed to: ${executorAddress}`)

  // ── RiskGuard ──────────────────────────────────────────────────────────────
  const RiskFactory   = await ethers.getContractFactory('RiskGuard')
  const riskGuard     = await RiskFactory.deploy()
  await riskGuard.waitForDeployment()
  const riskAddress   = await riskGuard.getAddress()
  console.log(`✅ RiskGuard      deployed to: ${riskAddress}`)

  console.log('\n─────────────────────────────────────────────────────────────')
  console.log('Add these to your backend/.env:')
  console.log(`MANDATE_POLICY_CONTRACT=${policyAddress}`)
  console.log(`AGENT_EXECUTOR_CONTRACT=${executorAddress}`)
  console.log(`RISK_GUARD_CONTRACT=${riskAddress}`)
  console.log('─────────────────────────────────────────────────────────────')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
