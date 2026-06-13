import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { findRelevantDocs } from '@/lib/docsKnowledgeBase'
import {
  MANDATE_POLICY_ADDRESS,
  AGENT_EXECUTOR_ADDRESS,
  RISK_GUARD_ADDRESS,
  SWAP_POOL_ADDRESS,
  MOCK_USD_ADDRESS,
  MOCK_WETH_ADDRESS,
} from '@/lib/contracts'

export const runtime = 'nodejs'

// Read-only MCP server exposing public MantleMandate platform data
// (docs, deployed contract addresses, mandate policy schema) to MCP
// clients such as Claude Desktop. No auth required — no user data exposed.
function createServer(): McpServer {
  const server = new McpServer({ name: 'mantlemandate', version: '1.0.0' })

  server.tool(
    'search_docs',
    'Search MantleMandate documentation for articles relevant to a query (e.g. "how do I write a mandate with RSI conditions")',
    { query: z.string().describe('Search query, e.g. a user question about the platform') },
    async ({ query }) => {
      const docs = findRelevantDocs(query, 3)
      return {
        content: [{
          type: 'text',
          text: docs.length
            ? JSON.stringify(docs.map(d => ({ id: d.id, title: d.title, category: d.category, summary: d.summary })), null, 2)
            : 'No matching documentation found.',
        }],
      }
    }
  )

  server.tool(
    'get_contract_addresses',
    "Get MantleMandate's deployed smart contract addresses on Mantle Sepolia Testnet",
    async () => ({
      content: [{
        type: 'text',
        text: JSON.stringify({
          network: 'Mantle Sepolia Testnet',
          chainId: 5003,
          contracts: {
            MandatePolicy: MANDATE_POLICY_ADDRESS,
            AgentExecutor: AGENT_EXECUTOR_ADDRESS,
            RiskGuard:     RISK_GUARD_ADDRESS,
            MockSwapPool:  SWAP_POOL_ADDRESS,
            MockUSD:       MOCK_USD_ADDRESS,
            MockWETH:      MOCK_WETH_ADDRESS,
          },
        }, null, 2),
      }],
    })
  )

  server.tool(
    'get_mandate_policy_schema',
    'Get the field schema for a MantleMandate trading mandate policy, for drafting a plain-English mandate compatible with the platform',
    async () => ({
      content: [{
        type: 'text',
        text: JSON.stringify({
          asset:        'Primary token to trade (e.g. "ETH", "MNT", "USDC")',
          trigger:      'Condition that triggers a trade (e.g. "RSI < 30", "price drops 5%", "daily rebalance")',
          riskPerTrade: 'Percentage of capital per trade (default 5)',
          takeProfit:   'Percentage gain to close position (null if not specified)',
          stopLoss:     'Percentage loss to close position (default 5)',
          schedule:     'How often to run: "continuous" | "hourly" | "daily" | "weekly"',
          venue:        'DEX to use: "merchant_moe" | "agni" | "fluxion" | null for best available',
          maxDrawdown:  'Maximum portfolio drawdown before halting (default 15)',
          maxPositions: 'Max concurrent open positions (default 5)',
          summary:      'One sentence plain-English summary of what the mandate does',
        }, null, 2),
      }],
    })
  )

  return server
}

export async function POST(req: Request) {
  const server = createServer()
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)
  return transport.handleRequest(req)
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function DELETE() {
  return new Response('Method Not Allowed', { status: 405 })
}
