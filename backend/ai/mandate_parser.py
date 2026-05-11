import os
import json
import hashlib
import urllib.request
from typing import Optional

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


def _openrouter_chat(messages: list, max_tokens: int = 1024) -> str:
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        raise RuntimeError('OPENROUTER_API_KEY environment variable is not set')

    body = json.dumps({
        'model': 'anthropic/claude-haiku-4-5',
        'max_tokens': max_tokens,
        'messages': messages,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://openrouter.ai/api/v1/chat/completions',
        data=body,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'HTTP-Referer': 'https://mantlemandate.io',
            'X-Title': 'MantleMandate',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data['choices'][0]['message']['content'].strip()


def parse_mandate(mandate_text: str) -> dict:
    """
    Parse a plain-English trading mandate into a structured policy dict.
    Uses Claude via OpenRouter to extract trading parameters from natural language.
    """
    raw = _openrouter_chat([
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user',   'content': f'Parse this trading mandate:\n\n{mandate_text}'},
    ])

    # Strip markdown code fences if model wraps the JSON
    if raw.startswith('```'):
        lines = raw.splitlines()
        raw = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])

    try:
        policy = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise MandateParseError(f'Failed to parse LLM response as JSON: {exc}') from exc

    return _apply_defaults(policy)


def hash_policy(policy: dict) -> str:
    """Deterministic SHA-256 hex digest of the policy dict — posted on-chain."""
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
