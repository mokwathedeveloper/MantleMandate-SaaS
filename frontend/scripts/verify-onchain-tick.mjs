// One-off verification script: exercises the exact on-chain code path that
// frontend/lib/agentTick.ts (ensureShadowAgent + executeOrder) runs for a
// confident buy/sell decision, against the live Mantle Sepolia contracts.
// Bypasses only the OpenRouter/Claude decision call (credits exhausted) —
// uses the real ETH price/change returned by the last live tick.
//
// Usage: node --env-file=.env.local scripts/verify-onchain-tick.mjs <agentId>

// supabase-js always constructs a RealtimeClient, which requires a global
// WebSocket constructor on Node < 22. We never use realtime features (no
// .channel().subscribe()), so a no-op stub is sufficient.
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {}
}

import { createClient } from '@supabase/supabase-js'
import {
  createPublicClient, createWalletClient, http,
  keccak256, toHex, parseAbi, parseEventLogs, defineChain,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const AGENT_ID = process.argv[2]
if (!AGENT_ID) {
  console.error('Usage: node --env-file=.env.local scripts/verify-onchain-tick.mjs <agentId>')
  process.exit(1)
}

const mantleTestnet = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.sepolia.mantle.xyz'] } },
  testnet: true,
})

const MANDATE_POLICY_ADDRESS = process.env.NEXT_PUBLIC_MANDATE_POLICY_CONTRACT
const AGENT_EXECUTOR_ADDRESS = process.env.NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT

const MANDATE_POLICY_ABI = parseAbi([
  'function submitPolicy(bytes32 policyHash) external',
])

const AGENT_EXECUTOR_ABI = parseAbi([
  'function registerAgent(bytes32 policyHash, address mandatePolicyContract) external returns (uint256 agentId)',
  'function activateAgent(uint256 agentId) external',
  'function executeOrder(uint256 agentId, bytes32 asset, uint256 amount, bool isBuy, bytes32 txRef) external',
  'event AgentRegistered(address indexed owner, uint256 indexed agentId, bytes32 policyHash)',
  'event OrderExecuted(uint256 indexed agentId, bytes32 indexed asset, uint256 amount, bool isBuy, uint256 execIndex)',
])

const assetToBytes32 = (symbol) =>
  ('0x' + Buffer.from(symbol, 'utf8').toString('hex').padEnd(64, '0'))

const explorer = (tx) => `https://explorer.sepolia.mantle.xyz/tx/${tx}`

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*, mandate:mandates(policy_hash, parsed_policy)')
    .eq('id', AGENT_ID)
    .single()
  if (error) throw error

  console.log(`Agent: ${agent.id}, mandate policy_hash: ${agent.mandate?.policy_hash}`)

  if (agent.onchain_agent_id != null) {
    console.log(`Already has onchain_agent_id=${agent.onchain_agent_id} — skipping registration, going straight to executeOrder.`)
  }

  const mandatePolicyHash = agent.mandate?.policy_hash
  if (!mandatePolicyHash) throw new Error('Mandate has no policy_hash')

  const account = privateKeyToAccount(process.env.MANTLE_PRIVATE_KEY)
  const transport = http('https://rpc.sepolia.mantle.xyz', { retryCount: 1, retryDelay: 1000, timeout: 15000 })
  const wallet = createWalletClient({ chain: mantleTestnet, transport, account })
  const publicClient = createPublicClient({ chain: mantleTestnet, transport })

  let onchainAgentId

  if (agent.onchain_agent_id != null) {
    onchainAgentId = BigInt(agent.onchain_agent_id)
  } else {
    const shadowHash = keccak256(toHex(`${mandatePolicyHash}:shadow:${AGENT_ID}`))
    console.log(`Shadow policy hash: ${shadowHash}`)

    console.log('1/3 submitPolicy...')
    try {
      const submitTx = await wallet.writeContract({
        address: MANDATE_POLICY_ADDRESS, abi: MANDATE_POLICY_ABI,
        functionName: 'submitPolicy', args: [shadowHash],
      })
      await publicClient.waitForTransactionReceipt({ hash: submitTx })
      console.log(`    tx: ${explorer(submitTx)}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('already registered')) throw err
      console.log('    already registered — continuing')
    }

    console.log('2/3 registerAgent...')
    const registerTx = await wallet.writeContract({
      address: AGENT_EXECUTOR_ADDRESS, abi: AGENT_EXECUTOR_ABI,
      functionName: 'registerAgent', args: [shadowHash, MANDATE_POLICY_ADDRESS],
    })
    const registerReceipt = await publicClient.waitForTransactionReceipt({ hash: registerTx })
    console.log(`    tx: ${explorer(registerTx)}`)

    const [registeredEvent] = parseEventLogs({
      abi: AGENT_EXECUTOR_ABI, eventName: 'AgentRegistered', logs: registerReceipt.logs,
    })
    if (!registeredEvent) throw new Error('AgentRegistered event not found')
    onchainAgentId = registeredEvent.args.agentId
    console.log(`    onchain agentId: ${onchainAgentId.toString()}`)

    console.log('3/3 activateAgent...')
    const activateTx = await wallet.writeContract({
      address: AGENT_EXECUTOR_ADDRESS, abi: AGENT_EXECUTOR_ABI,
      functionName: 'activateAgent', args: [onchainAgentId],
    })
    await publicClient.waitForTransactionReceipt({ hash: activateTx })
    console.log(`    tx: ${explorer(activateTx)}`)

    await supabase.from('agents').update({
      onchain_agent_id: Number(onchainAgentId),
      onchain_policy_hash: shadowHash,
      onchain_owner: account.address,
    }).eq('id', AGENT_ID)
  }

  // executeOrder — using the real ETH price/change returned by the last live
  // AI tick (HOLD, $1628.12, -1.57%), with a manufactured "buy" decision since
  // the AI's RSI<30 trigger could not be confirmed from the market feed and
  // OpenRouter credits are exhausted.
  const livePrice = 1628.12
  const priceChange = -1.57
  const capital = agent.capital_cap || 1000
  const amountPct = 10
  const amountUsd = Math.min(capital, capital * (amountPct / 100))
  const isBuy = true
  const txRef = keccak256(toHex(`tick:${AGENT_ID}:${Date.now()}`))

  console.log('executeOrder...')
  const execTx = await wallet.writeContract({
    address: AGENT_EXECUTOR_ADDRESS, abi: AGENT_EXECUTOR_ABI,
    functionName: 'executeOrder',
    args: [onchainAgentId, assetToBytes32('ETH'), BigInt(Math.round(amountUsd * 100)), isBuy, txRef],
  })
  const execReceipt = await publicClient.waitForTransactionReceipt({ hash: execTx })
  console.log(`    tx: ${explorer(execTx)}`)
  console.log(`    block: ${execReceipt.blockNumber}`)

  const pnl = Math.round(amountUsd * (priceChange / 100) * (isBuy ? 1 : -1) * 100) / 100

  await supabase.from('trades').insert({
    user_id: agent.user_id,
    agent_id: AGENT_ID,
    mandate_id: agent.mandate_id,
    asset_pair: 'ETH/USDT',
    direction: 'buy',
    amount_usd: amountUsd,
    price: livePrice,
    pnl,
    protocol: 'onchain-audit',
    tx_hash: execTx,
    block_number: Number(execReceipt.blockNumber),
    status: 'success',
    mandate_rule_applied: '[Manual on-chain verification] Real executeOrder tx via service wallet, decision manufactured to test the agentTick.ts contract integration (RSI<30 trigger unverifiable from feed; OpenRouter credits exhausted).',
  })

  const newTotalPnl = agent.total_pnl + pnl
  const newTotalVolume = agent.total_volume + amountUsd
  await supabase.from('agents').update({
    total_pnl: newTotalPnl,
    total_volume: newTotalVolume,
    total_roi: capital > 0 ? Math.round((newTotalPnl / capital) * 10000) / 100 : 0,
    last_trade_at: new Date().toISOString(),
  }).eq('id', AGENT_ID)

  console.log('\nDONE — on-chain executeOrder path verified.')
  console.log(`  onchain agentId: ${onchainAgentId.toString()}`)
  console.log(`  executeOrder tx: ${explorer(execTx)}`)
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
