from datetime import datetime, timedelta, timezone
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app.portfolio import portfolio_bp
from app.extensions import db
from app.models.agent import Agent
from app.models.trade import Trade


@portfolio_bp.route('/stats', methods=['GET'])
@jwt_required()
def portfolio_stats():
    user_id = get_jwt_identity()

    agents = Agent.query.filter_by(user_id=user_id).all()
    active_agents = sum(1 for a in agents if a.status == 'active')
    total_pnl  = sum(float(a.total_pnl) for a in agents)
    total_value = sum(float(a.capital_cap or 0) for a in agents) + total_pnl

    since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    trades_24h = (
        Trade.query
        .filter(Trade.user_id == user_id, Trade.created_at >= since_24h, Trade.status == 'success')
        .all()
    )
    pnl_24h = sum(float(t.pnl or 0) for t in trades_24h)

    total_trades = Trade.query.filter_by(user_id=user_id, status='success').count()
    win_trades   = Trade.query.filter(
        Trade.user_id == user_id, Trade.status == 'success', Trade.pnl > 0
    ).count()
    win_rate = (win_trades / total_trades * 100) if total_trades > 0 else 0.0

    capital_base = sum(float(a.capital_cap or 0) for a in agents)
    pnl_pct      = (total_pnl / capital_base * 100) if capital_base > 0 else 0.0

    return jsonify(data={
        'total_value':    round(total_value, 2),
        'total_pnl_24h':  round(pnl_24h, 2),
        'total_pnl_pct':  round(pnl_pct, 4),
        'active_agents':  active_agents,
        'total_trades':   total_trades,
        'win_rate':       round(win_rate, 2),
    }), 200


@portfolio_bp.route('/history', methods=['GET'])
@jwt_required()
def portfolio_history():
    user_id = get_jwt_identity()
    days    = request.args.get('days', 30, type=int)
    days    = max(1, min(days, 365))

    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Fetch successful trades with cumulative PnL per day
    trades = (
        Trade.query
        .filter(Trade.user_id == user_id, Trade.status == 'success', Trade.created_at >= since)
        .order_by(Trade.created_at.asc())
        .all()
    )

    # Build daily buckets
    agents     = Agent.query.filter_by(user_id=user_id).all()
    base_value = sum(float(a.capital_cap or 0) for a in agents)

    buckets: dict[str, float] = {}
    for t in trades:
        day = t.created_at.strftime('%Y-%m-%d')
        buckets[day] = buckets.get(day, 0) + float(t.pnl or 0)

    # Fill in all days (including zero-pnl days)
    result = []
    cumulative = 0.0
    for i in range(days):
        date = (since + timedelta(days=i + 1)).strftime('%Y-%m-%d')
        cumulative += buckets.get(date, 0)
        result.append({
            'date':  date,
            'value': round(base_value + cumulative, 2),
            'pnl':   round(cumulative, 2),
        })

    return jsonify(data=result), 200
