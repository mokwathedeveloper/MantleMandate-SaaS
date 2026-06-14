import { ethers, network } from 'hardhat'

// Deploys AgentReputationRegistry against the already-live AgentExecutor
// (read from backend/.env via hardhat.config.ts's dotenv load) — does NOT
// touch MandatePolicy, AgentExecutor, or RiskGuard. Run this once; re-running
// deploys a fresh (separate) registry instance with an empty history.
async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying AgentReputationRegistry on ${network.name}`)
  console.log(`Deployer: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log(`Balance:  ${ethers.formatEther(balance)} MNT\n`)

  const executorAddress = process.env.AGENT_EXECUTOR_CONTRACT
  if (!executorAddress) throw new Error('AGENT_EXECUTOR_CONTRACT is not set in backend/.env')
  console.log(`Using live AgentExecutor: ${executorAddress}`)

  const ReputationFactory  = await ethers.getContractFactory('AgentReputationRegistry')
  const reputationRegistry = await ReputationFactory.deploy(executorAddress)
  await reputationRegistry.waitForDeployment()
  const reputationAddress  = await reputationRegistry.getAddress()
  console.log(`✅ AgentReputationRegistry deployed to: ${reputationAddress}`)

  console.log('\n─────────────────────────────────────────────────────────────')
  console.log('Add to backend/.env:')
  console.log(`AGENT_REPUTATION_REGISTRY_CONTRACT=${reputationAddress}`)
  console.log('\nAdd to frontend/.env.local and Vercel:')
  console.log(`NEXT_PUBLIC_AGENT_REPUTATION_REGISTRY_CONTRACT=${reputationAddress}`)
  console.log('─────────────────────────────────────────────────────────────')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
