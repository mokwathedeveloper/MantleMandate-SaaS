"""
Agent execution loop — the core AI innovation of MantleMandate.

Each deployed agent runs this Celery task in a loop:
  1. Load mandate policy from DB
  2. Fetch simulated market data for the target asset
  3. Ask Claude Haiku to evaluate policy vs market → TRADE or HOLD
  4. If TRADE: record trade, update P&L, enforce risk limits
  5. If risk limits breached: pause agent, emit alert
  6. Sleep and repeat
"""

import hashlib
import json
import logging
import os
import random
import time
from datetime import datetime, timezone
from decimal import Decimal

import urllib.request

logger = logging.getLogger(__name__)

# Simulated price feeds — realistic mid-prices for Mantle DeFi assets
BASE_PRICES: dict[str, float] = {
    'ETH/USDC':  3_250.0,
    'MNT/USDC':  1.05,
    'USDT/USDC': 1.0005,
    'BTC/USDC':  67_000.0,
    'WBTC/USDC': 66_800.0,
}

PROTOCOLS = ['merchant_moe', 'agni', 'fluxion']

DECISION_PROMPT = """\
You are an autonomous DeFi trading agent governed by a strict mandate policy.

## Mandate Policy
{policy}

## Current Market Data
- Asset: {asset}
- Current price: {price} USDC
- 1h change: {change_1h:.2f}%
- 24h change: {change_24h:.2f}%
- Volume index: {volume:.1f} (1.0 = average)
- Current time (UTC): {timestamp}

## Agent State
- Current positions: {positions}
- Capital deployed: {deployed_pct:.1f}% of cap
- Drawdown since start: {drawdown:.2f}%

## Instructions
Evaluate whether to trade RIGHT NOW based solely on the mandate policy.
Reply with EXACTLY one of these JSON formats (no markdown, no explanation):

If trading: {{"action":"TRADE","direction":"buy","asset_pair":"{asset}","amount_pct":<0.01-1.0>,"reason":"<one sentence>"}}
If holding: {{"action":"HOLD","reason":"<one sentence>"}}
If risk limits require stopping: {{"action":"PAUSE","reason":"<one sentence>"}}
"""


def _simulated_price(pair: str) -> dict:
    base = BASE_PRICES.get(pair, 1.0)
    noise_1h  = random.gauss(0, 0.008)
    noise_24h = random.gauss(0, 0.025)
    price = base * (1 + noise_1h)
    return {
        'price':      round(price, 6),
        'change_1h':  round(noise_1h * 100, 3),
        'change_24h': round(noise_24h * 100, 3),
        'volume':     round(random.lognormvariate(0, 0.4), 2),
    }


def _call_claude(prompt: str) -> dict:
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        raise RuntimeError('OPENROUTER_API_KEY environment variable is not set')
    body = json.dumps({
        'model': 'anthropic/claude-haiku-4-5',
        'max_tokens': 256,
        'messages': [{'role': 'user', 'content': prompt}],
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
    text = data['choices'][0]['message']['content'].strip()
    return json.loads(text)


def _hash_decision(decision: dict, market: dict, timestamp: str) -> str:
    payload = json.dumps({'decision': decision, 'market': market, 'ts': timestamp}, sort_keys=True)
    return '0x' + hashlib.sha256(payload.encode()).hexdigest()


def run_agent_once(agent_id: str) -> dict:
    """
    Execute a single decision cycle for an agent.
    Returns a summary dict suitable for logging.
    Called by the Celery task and also directly from tests.
    """
    from app.extensions import db
    from app.models.agent import Agent
    from app.models.trade import Trade
    from app.models.audit_log import AuditLog
    from app.models.alert import Alert

    agent = Agent.query.get(agent_id)
    if not agent or agent.status != 'active':
        return {'skipped': True, 'reason': 'agent not active'}

    mandate = agent.mandate
    if not mandate or not mandate.parsed_policy:
        return {'skipped': True, 'reason': 'no parsed policy'}

    policy      = mandate.parsed_policy
    risk_params = mandate.risk_params or {}

    # Determine which asset pair to trade
    asset_pair = policy.get('asset_pair', 'ETH/USDC')
    if asset_pair not in BASE_PRICES:
        asset_pair = 'ETH/USDC'

    market = _simulated_price(asset_pair)
    now    = datetime.now(timezone.utc)

    # Count open positions (pending trades)
    open_positions = Trade.query.filter_by(agent_id=agent_id, status='pending').count()
    max_positions  = risk_params.get('maxPositions', 5)
    capital_cap    = float(agent.capital_cap or 10_000)

    deployed_value = float(
        db.session.query(db.func.sum(Trade.amount_usd))
        .filter_by(agent_id=agent_id, status='pending')
        .scalar() or 0
    )
    deployed_pct   = (deployed_value / capital_cap * 100) if capital_cap > 0 else 0
    drawdown       = float(agent.drawdown_current)

    prompt = DECISION_PROMPT.format(
        policy=json.dumps(policy, indent=2),
        asset=asset_pair,
        price=market['price'],
        change_1h=market['change_1h'],
        change_24h=market['change_24h'],
        volume=market['volume'],
        timestamp=now.isoformat(),
        positions=open_positions,
        deployed_pct=deployed_pct,
        drawdown=drawdown,
    )

    try:
        decision = _call_claude(prompt)
    except Exception as exc:
        return {'skipped': True, 'reason': f'Claude error: {exc}'}

    decision_hash = _hash_decision(decision, market, now.isoformat())
    action        = decision.get('action', 'HOLD')

    if action == 'TRADE':
        if open_positions >= max_positions:
            action = 'HOLD'
            decision['reason'] = f'Max positions ({max_positions}) reached — holding'
        else:
            direction  = decision.get('direction', 'buy')
            amount_pct = min(float(decision.get('amount_pct', 0.1)),
                             risk_params.get('maxPosition', 0.2) / 100 if risk_params.get('maxPosition', 20) > 1
                             else risk_params.get('maxPosition', 0.2))
            # Normalise: if risk_params stores 0-100 scale, convert
            if risk_params.get('maxPosition', 20) > 1:
                max_pos_pct = risk_params['maxPosition'] / 100
                amount_pct  = min(amount_pct, max_pos_pct)

            trade_amount = capital_cap * amount_pct
            fee          = trade_amount * random.uniform(0.001, 0.003)  # 0.1-0.3% protocol fee
            slippage     = trade_amount * random.uniform(0.0001, 0.001)

            # Simulate PnL (close half of open positions with realistic outcomes)
            pnl = None
            if direction == 'sell' and open_positions > 0:
                pnl = trade_amount * random.gauss(0.008, 0.025) - fee - slippage

            trade = Trade(
                agent_id=str(agent.id),
                user_id=str(agent.user_id),
                mandate_id=str(agent.mandate_id) if agent.mandate_id else None,
                asset_pair=asset_pair,
                direction=direction,
                amount_usd=Decimal(str(round(trade_amount, 2))),
                price=Decimal(str(market['price'])),
                pnl=Decimal(str(round(pnl, 4))) if pnl is not None else None,
                protocol=random.choice(PROTOCOLS),
                status='success',
                mandate_rule_applied=decision.get('reason', ''),
            )
            db.session.add(trade)
            db.session.flush()

            # Update agent metrics
            if pnl is not None:
                agent.total_pnl    += Decimal(str(round(pnl, 4)))
                agent.total_volume += Decimal(str(round(trade_amount, 2)))
                if capital_cap > 0:
                    agent.total_roi = agent.total_pnl / Decimal(str(capital_cap)) * 100

                # Update drawdown
                if pnl < 0:
                    loss_pct = abs(pnl) / capital_cap * 100
                    agent.drawdown_current = max(agent.drawdown_current, Decimal(str(loss_pct)))

            agent.last_trade_at = now

            # Risk check: maxDrawdown
            max_drawdown = risk_params.get('maxDrawdown', 15)
            if float(agent.drawdown_current) >= max_drawdown:
                agent.status = 'paused'
                alert = Alert(
                    user_id=str(agent.user_id), agent_id=str(agent.id),
                    alert_type='drawdown_limit_reached', severity='high',
                    title=f'Agent "{agent.name}" paused — drawdown limit reached',
                    message=f'Drawdown hit {float(agent.drawdown_current):.2f}% (limit: {max_drawdown}%)',
                )
                db.session.add(alert)

            log = AuditLog(
                user_id=str(agent.user_id), agent_id=str(agent.id), trade_id=str(trade.id),
                event_type='trade_executed', decision_hash=decision_hash,
                details={'action': action, 'market': market, 'reason': decision.get('reason')},
            )
            db.session.add(log)

    elif action == 'PAUSE':
        agent.status = 'paused'
        alert = Alert(
            user_id=str(agent.user_id), agent_id=str(agent.id),
            alert_type='agent_self_paused', severity='high',
            title=f'Agent "{agent.name}" paused itself',
            message=decision.get('reason', 'Risk limits triggered'),
        )
        db.session.add(alert)
        log = AuditLog(
            user_id=str(agent.user_id), agent_id=str(agent.id),
            event_type='agent_self_paused', decision_hash=decision_hash,
            details={'reason': decision.get('reason')},
        )
        db.session.add(log)
    else:
        log = AuditLog(
            user_id=str(agent.user_id), agent_id=str(agent.id),
            event_type='trade_skipped', decision_hash=decision_hash,
            details={'reason': decision.get('reason'), 'market': market},
        )
        db.session.add(log)

    db.session.commit()
    return {'action': action, 'asset': asset_pair, 'market': market, 'decision': decision}


def run_agent_loop(agent_id: str, interval_seconds: int = 300):
    """
    Celery task body — runs in a loop until the agent is stopped/paused.
    Called via .apply_async() from the deploy endpoint.
    """
    while True:
        try:
            result = run_agent_once(agent_id)
            if result.get('skipped') and result.get('reason') == 'agent not active':
                break
        except Exception as e:
            logger.error('Agent %s loop iteration failed: %s', agent_id, e)

        time.sleep(interval_seconds)


# Register as Celery task when celery_worker imports this module
try:
    from celery_worker import celery as _celery
    run_agent_loop = _celery.task(name='ai.agent_loop.run_agent_loop', bind=False)(run_agent_loop)
except ImportError:
    logger.debug('Celery not available — run_agent_loop will run synchronously')
