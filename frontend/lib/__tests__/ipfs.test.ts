import {
  canonicalizeReasoning,
  computeReasoningDigest,
  computeReasoningCid,
  digestToCid,
  pinReasoning,
  type ReasoningPayload,
} from '../ipfs'

const PAYLOAD: ReasoningPayload = {
  agentId: 'agent-1',
  onchainAgentId: '0',
  asset: 'ETH',
  action: 'buy',
  confidence: 78,
  reasoning: 'RSI oversold, 24h momentum turning positive.',
  amountPct: 10,
  urgency: 'medium',
  livePrice: 2500.5,
  priceChange: 1.25,
  rsi: 28.4,
  timestamp: '2026-06-14T12:00:00.000Z',
}

describe('canonicalizeReasoning', () => {
  it('produces identical output regardless of key order', () => {
    const reordered: ReasoningPayload = {
      timestamp: PAYLOAD.timestamp,
      asset: PAYLOAD.asset,
      agentId: PAYLOAD.agentId,
      onchainAgentId: PAYLOAD.onchainAgentId,
      action: PAYLOAD.action,
      confidence: PAYLOAD.confidence,
      reasoning: PAYLOAD.reasoning,
      amountPct: PAYLOAD.amountPct,
      urgency: PAYLOAD.urgency,
      livePrice: PAYLOAD.livePrice,
      priceChange: PAYLOAD.priceChange,
      rsi: PAYLOAD.rsi,
    }
    expect(canonicalizeReasoning(reordered)).toEqual(canonicalizeReasoning(PAYLOAD))
  })
})

describe('computeReasoningDigest', () => {
  it('is deterministic for the same payload', () => {
    const a = computeReasoningDigest(PAYLOAD)
    const b = computeReasoningDigest({ ...PAYLOAD })
    expect(a).toEqual(b)
  })

  it('returns a 0x-prefixed 32-byte hex string', () => {
    const digest = computeReasoningDigest(PAYLOAD)
    expect(digest).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('changes when the payload changes', () => {
    const a = computeReasoningDigest(PAYLOAD)
    const b = computeReasoningDigest({ ...PAYLOAD, confidence: 79 })
    expect(a).not.toEqual(b)
  })
})

describe('digestToCid / computeReasoningCid', () => {
  it('produces a CIDv1 (base32, "b" multibase prefix)', () => {
    const cid = computeReasoningCid(PAYLOAD)
    expect(cid.startsWith('b')).toBe(true)
    expect(cid).toMatch(/^b[a-z2-7]+$/)
  })

  it('is deterministic and derivable from the digest alone', () => {
    const digest = computeReasoningDigest(PAYLOAD)
    expect(digestToCid(digest)).toEqual(computeReasoningCid(PAYLOAD))
  })

  it('rejects digests that are not 32 bytes', () => {
    expect(() => digestToCid('0x1234')).toThrow('digestToCid: digest must be 32 bytes')
  })
})

describe('pinReasoning', () => {
  const originalEnv = { ...process.env }
  const originalFetch = global.fetch

  afterEach(() => {
    process.env = { ...originalEnv }
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('returns pinned: false when neither PINATA_JWT nor IPFS_PIN_API_URL is configured', async () => {
    delete process.env.PINATA_JWT
    delete process.env.IPFS_PIN_API_URL
    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(false)
    expect(result.cid).toEqual(computeReasoningCid(PAYLOAD))
    expect(result.gatewayUrl).toBeUndefined()
  })

  it('pins to Pinata and returns its IpfsHash as the CID when PINATA_JWT is set', async () => {
    delete process.env.IPFS_PIN_API_URL
    process.env.PINATA_JWT = 'pinata-jwt'
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ IpfsHash: 'QmPinataHash' }),
    }) as unknown as typeof fetch

    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(true)
    expect(result.cid).toEqual('QmPinataHash')
    expect(result.gatewayUrl).toEqual('https://ipfs.io/ipfs/QmPinataHash')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer pinata-jwt' },
      })
    )
  })

  it('falls back to the generic endpoint when the Pinata request fails', async () => {
    process.env.PINATA_JWT = 'pinata-jwt'
    process.env.IPFS_PIN_API_URL = 'https://pin.example.com/add'
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true }) as unknown as typeof fetch

    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(true)
    expect(result.cid).toEqual(computeReasoningCid(PAYLOAD))
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to pinned: false when both Pinata and the fetch call throw', async () => {
    process.env.PINATA_JWT = 'pinata-jwt'
    delete process.env.IPFS_PIN_API_URL
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch

    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(false)
    expect(result.cid).toEqual(computeReasoningCid(PAYLOAD))
  })

  it('returns pinned: true with a gateway URL when the pin endpoint succeeds', async () => {
    delete process.env.PINATA_JWT
    process.env.IPFS_PIN_API_URL = 'https://pin.example.com/add'
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch

    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(true)
    expect(result.cid).toEqual(computeReasoningCid(PAYLOAD))
    expect(result.gatewayUrl).toEqual(`https://ipfs.io/ipfs/${result.cid}`)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://pin.example.com/add',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns pinned: false when the pin endpoint responds with an error', async () => {
    delete process.env.PINATA_JWT
    process.env.IPFS_PIN_API_URL = 'https://pin.example.com/add'
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch

    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(false)
  })

  it('returns pinned: false when the fetch call throws', async () => {
    delete process.env.PINATA_JWT
    process.env.IPFS_PIN_API_URL = 'https://pin.example.com/add'
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch

    const result = await pinReasoning(PAYLOAD)
    expect(result.pinned).toBe(false)
  })

  it('includes an Authorization header when IPFS_PIN_API_TOKEN is set', async () => {
    delete process.env.PINATA_JWT
    process.env.IPFS_PIN_API_URL = 'https://pin.example.com/add'
    process.env.IPFS_PIN_API_TOKEN = 'secret-token'
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch

    await pinReasoning(PAYLOAD)
    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(options.headers.Authorization).toEqual('Bearer secret-token')
  })
})
