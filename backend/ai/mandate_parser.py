import os
import json
import hashlib
from typing import Optional
import anthropic

_client: Optional[anthropic.Anthropic] = None

SYSTEM_PROMPT = """You are a quantitative trading policy compiler for a DeFi platform called MantleMandate.

Your job: convert plain-English trading mandates written by users into structured, machine-executable JSON policies.

The output must be a single valid JSON object — no markdown, no explanation, just JSON.

Schema:
{
  "asset": "string — primary asset symbol (e.g. ETH, BTC, MNT, USDC)",
  "base_currency": "string — quote currency (default: USDC)",
  "trigger": "string — what condition triggers a trade (e.g. RSI_below_30, price_drop_5pct, momentum_positive)",
  "direction": "buy | sell | both",
  "risk_per_trade": "number — max % of capital per trade (0.01 to 0.25)",
  "take_profit": "number | null — % gain to close position (e.g. 0.10 for 10%)",
  "stop_loss": "number | null — % loss to close position (e.g. 0.05 for 5%)",
  "max_drawdown": "number — max portfolio drawdown before agent pauses (default: 0.15)",
  "max_positions": "integer — max concurrent open positions (default: 3)",
  "cooldown_hours": "integer — minimum hours between trades (default: 1)",
  "schedule": "string — trading frequency: continuous | hourly | daily | weekly",
  "venue": "merchant_moe | agni | fluxion | auto — preferred DEX (default: auto)",
  "strategy_type": "string — momentum | mean_reversion | dca | breakout | yield | custom",
  "capital_cap_usd": "number | null — absolute USD cap on capital used (null = use account setting)"
}

Rules:
- Always produce valid JSON, never produce invalid JSON
- Use conservative defaults when the user does not specify a parameter
- If the user specifies a percentage with %, convert it to a decimal (5% = 0.05)
- If the user says "a small amount" or vague sizing, use risk_per_trade: 0.02
- If the user mentions MNT, set venue to merchant_moe or auto
- If the mandate is ambiguous or too vague to parse safely, still produce valid JSON with conservative defaults and add a "warnings" array of strings explaining what was assumed
"""


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not api_key:
            raise RuntimeError('ANTHROPIC_API_KEY environment variable is not set')
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def parse_mandate(mandate_text: str) -> dict:
    """
    Parse a plain-English trading mandate into a structured policy dict.

    Uses Claude to extract trading parameters from natural language.
    Returns a policy dict guaranteed to have all required keys.
    Raises MandateParseError if the response cannot be parsed as JSON.
    """
    client = _get_client()

    message = client.messages.create(
        model='claude-haiku-4-5-20251001',
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                'role': 'user',
                'content': f'Parse this trading mandate:\n\n{mandate_text}',
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if Claude wraps the JSON
    if raw.startswith('```'):
        lines = raw.splitlines()
        raw = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])

    try:
        policy = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise MandateParseError(f'Failed to parse LLM response as JSON: {exc}') from exc

    policy = _apply_defaults(policy)
    return policy


def hash_policy(policy: dict) -> str:
    """
    Produce a deterministic SHA-256 hex digest of the policy dict.
    This is the value posted on-chain as the mandate policy hash.
    """
    canonical = json.dumps(policy, sort_keys=True, separators=(',', ':'))
    return '0x' + hashlib.sha256(canonical.encode('utf-8')).hexdigest()


def _apply_defaults(policy: dict) -> dict:
    defaults = {
        'asset': 'ETH',
        'base_currency': 'USDC',
        'trigger': 'manual',
        'direction': 'both',
        'risk_per_trade': 0.02,
        'take_profit': None,
        'stop_loss': 0.05,
        'max_drawdown': 0.15,
        'max_positions': 3,
        'cooldown_hours': 1,
        'schedule': 'continuous',
        'venue': 'auto',
        'strategy_type': 'custom',
        'capital_cap_usd': None,
    }
    for key, value in defaults.items():
        if key not in policy:
            policy[key] = value
    return policy


class MandateParseError(Exception):
    pass
