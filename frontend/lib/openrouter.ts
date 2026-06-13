import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage, AIMessage, type BaseMessage, type MessageContent } from '@langchain/core/messages'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const MODEL = 'anthropic/claude-sonnet-4-5'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function toLangChainMessage(msg: Message): BaseMessage {
  switch (msg.role) {
    case 'system':    return new SystemMessage(msg.content)
    case 'assistant': return new AIMessage(msg.content)
    default:          return new HumanMessage(msg.content)
  }
}

function contentToString(content: MessageContent): string {
  if (typeof content === 'string') return content
  return content
    .map(part => (typeof part === 'string' ? part : 'text' in part ? part.text : ''))
    .join('')
}

export async function chat(messages: Message[], opts?: { temperature?: number }): Promise<string> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: MODEL,
    temperature: opts?.temperature ?? 0.2,
    maxTokens: 512,
    configuration: {
      baseURL: OPENROUTER_BASE,
      defaultHeaders: {
        'HTTP-Referer': 'https://mantlemandate.app',
        'X-Title': 'MantleMandate',
      },
    },
  })

  try {
    const result = await model.invoke(messages.map(toLangChainMessage))
    return contentToString(result.content)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`OpenRouter error: ${message}`)
  }
}
