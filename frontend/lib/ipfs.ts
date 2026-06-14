import { createHash } from 'crypto'

/**
 * Server-side helpers for content-addressing an agent's trade reasoning.
 *
 * `computeReasoningDigest` / `computeReasoningCid` are pure, deterministic
 * functions with no network dependency — the digest doubles as the bytes32
 * commitment hash submitted to AgentReputationRegistry.commitDecision, and
 * the CID is derivable from that same digest by anyone re-hashing the
 * canonical JSON payload. `pinReasoning` is an optional, additive step that
 * only runs if the operator configures their own IPFS pinning endpoint —
 * when unset, the CID/digest are still real and verifiable, just unpinned.
 */

export interface ReasoningPayload {
  agentId:         string
  onchainAgentId:  string
  asset:           string
  action:          'buy' | 'sell' | 'hold'
  confidence:      number
  reasoning:       string
  amountPct:       number
  urgency:         'low' | 'medium' | 'high'
  livePrice:       number | null
  priceChange:     number | null
  rsi:             number | null
  timestamp:       string
}

export interface PinResult {
  cid:        string
  pinned:     boolean
  gatewayUrl?: string
}

// CIDv1 byte layout: [version=0x01][codec=raw 0x55][hash-fn=sha2-256 0x12][digest-len=32 0x20][...32-byte digest]
const CIDV1_RAW_SHA256_PREFIX = Buffer.from([0x01, 0x55, 0x12, 0x20])

// RFC4648 base32 (lowercase, no padding) — used by multibase prefix 'b'
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567'

function base32Encode(bytes: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

/** Canonical JSON form — sorted keys so the digest is independent of construction order. */
export function canonicalizeReasoning(payload: ReasoningPayload): string {
  return JSON.stringify(payload, Object.keys(payload).sort())
}

/** SHA-256 digest of the canonical payload, as a 0x-prefixed bytes32 hex string. */
export function computeReasoningDigest(payload: ReasoningPayload): `0x${string}` {
  const digest = createHash('sha256').update(canonicalizeReasoning(payload)).digest()
  return `0x${digest.toString('hex')}`
}

/** Convert a 32-byte sha256 digest (hex) into a CIDv1 (raw codec, base32). */
export function digestToCid(digestHex: string): string {
  const digest = Buffer.from(digestHex.replace(/^0x/, ''), 'hex')
  if (digest.length !== 32) throw new Error('digestToCid: digest must be 32 bytes')
  return `b${base32Encode(Buffer.concat([CIDV1_RAW_SHA256_PREFIX, digest]))}`
}

/** CIDv1 of the canonical reasoning payload, derived from `computeReasoningDigest`. */
export function computeReasoningCid(payload: ReasoningPayload): string {
  return digestToCid(computeReasoningDigest(payload))
}

/**
 * Pin the canonical reasoning JSON to Pinata (`PINATA_JWT`), uploading the
 * exact bytes that `computeReasoningDigest` hashes so the on-chain commitment
 * stays independently verifiable from the pinned file. Pinata wraps files in
 * UnixFS, so its returned CID differs from our raw-codec `computeReasoningCid`
 * — when pinned, that Pinata CID is the one returned (it's the one that
 * actually resolves on a public gateway).
 */
async function pinToPinata(body: string, localCid: string, jwt: string): Promise<PinResult | null> {
  try {
    const form = new FormData()
    form.append('file', new Blob([body], { type: 'application/json' }), `${localCid}.json`)
    form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    })
    if (!res.ok) return null
    const json = (await res.json()) as { IpfsHash?: string }
    if (!json.IpfsHash) return null
    return { cid: json.IpfsHash, pinned: true, gatewayUrl: `https://ipfs.io/ipfs/${json.IpfsHash}` }
  } catch {
    return null
  }
}

/**
 * Best-effort pin of the reasoning payload to IPFS. Tries Pinata first
 * (`PINATA_JWT`), then an operator-configured generic pinning endpoint
 * (`IPFS_PIN_API_URL`, optional `IPFS_PIN_API_TOKEN`). Returns a CID either
 * way — `pinned: false` means the locally-computed CID (still a valid,
 * recomputable fingerprint of the canonical payload), just not retrievable
 * from a public gateway.
 */
export async function pinReasoning(payload: ReasoningPayload): Promise<PinResult> {
  const localCid = computeReasoningCid(payload)
  const body = canonicalizeReasoning(payload)

  const pinataJwt = process.env.PINATA_JWT
  if (pinataJwt) {
    const pinned = await pinToPinata(body, localCid, pinataJwt)
    if (pinned) return pinned
  }

  const apiUrl = process.env.IPFS_PIN_API_URL
  if (!apiUrl) return { cid: localCid, pinned: false }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.IPFS_PIN_API_TOKEN
          ? { Authorization: `Bearer ${process.env.IPFS_PIN_API_TOKEN}` }
          : {}),
      },
      body,
    })
    if (!res.ok) return { cid: localCid, pinned: false }
    return { cid: localCid, pinned: true, gatewayUrl: `https://ipfs.io/ipfs/${localCid}` }
  } catch {
    return { cid: localCid, pinned: false }
  }
}
