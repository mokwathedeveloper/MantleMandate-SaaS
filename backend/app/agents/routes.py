import logging
from datetime import datetime, timezone
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.agents import agents_bp
from app.agents.schemas import AgentCreateSchema, AgentUpdateSchema
from app.extensions import db
from app.models.agent import Agent
from app.models.mandate import Mandate
from app.models.alert import Alert
from app.models.audit_log import AuditLog
from app.models.trade import Trade

logger = logging.getLogger(__name__)


def _own_agent(agent_id, user_id):
    return Agent.query.filter_by(id=agent_id, user_id=user_id).first()


@agents_bp.route('', methods=['GET'])
@jwt_required()
def list_agents():
    user_id = get_jwt_identity()
    status  = request.args.get('status')

    query = Agent.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    agents = query.order_by(Agent.created_at.desc()).all()
    return jsonify(data=[a.to_dict() for a in agents]), 200


@agents_bp.route('', methods=['POST'])
@jwt_required()
def create_agent():
    user_id = get_jwt_identity()
    schema  = AgentCreateSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    mandate = Mandate.query.filter_by(id=str(data['mandate_id']), user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404
    if mandate.status not in ('active', 'draft'):
        return jsonify(error='Conflict', message='Mandate must be active or draft to deploy an agent'), 409

    agent = Agent(
        user_id=user_id,
        mandate_id=str(data['mandate_id']),
        wallet_id=str(data['wallet_id']) if data.get('wallet_id') else None,
        name=data['name'],
        capital_cap=data.get('capital_cap'),
        status='inactive',
    )
    db.session.add(agent)
    db.session.flush()

    log = AuditLog(
        user_id=user_id,
        agent_id=agent.id,
        event_type='agent_created',
        details={'name': agent.name, 'mandate_id': str(mandate.id)},
    )
    db.session.add(log)
    db.session.commit()
    return jsonify(data=agent.to_dict(), message='Agent created'), 201


@agents_bp.route('/<agent_id>', methods=['GET'])
@jwt_required()
def get_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404
    return jsonify(data=agent.to_dict()), 200


@agents_bp.route('/<agent_id>', methods=['PUT'])
@jwt_required()
def update_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404

    schema = AgentUpdateSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    for field, value in data.items():
        setattr(agent, field, value)
    db.session.commit()
    return jsonify(data=agent.to_dict(), message='Agent updated'), 200


@agents_bp.route('/<agent_id>', methods=['DELETE'])
@jwt_required()
def delete_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404
    if agent.status == 'active':
        return jsonify(error='Conflict', message='Stop the agent before deleting'), 409

    db.session.delete(agent)
    db.session.commit()
    return jsonify(data=None, message='Agent deleted'), 200


# ── Lifecycle ─────────────────────────────────────────────────────────────────

@agents_bp.route('/<agent_id>/deploy', methods=['POST'])
@jwt_required()
def deploy_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404
    if agent.status == 'active':
        return jsonify(error='Conflict', message='Agent is already active'), 409

    # Import Celery task lazily to avoid circular imports
    try:
        from ai.agent_loop import run_agent_loop
        result = run_agent_loop.apply_async(args=[str(agent.id)])
        agent.celery_task_id = result.id
    except Exception as e:
        logger.warning('Celery unavailable — agent %s deployed without task: %s', agent.id, e)

    agent.status      = 'active'
    agent.deployed_at = datetime.now(timezone.utc)

    _create_alert(user_id, agent.id, 'agent_deployed', 'low',
                  f'Agent "{agent.name}" deployed',
                  'Agent is now active and monitoring for trading opportunities.')

    log = AuditLog(user_id=user_id, agent_id=agent.id, event_type='agent_deployed',
                   details={'mandate_id': str(agent.mandate_id)})
    db.session.add(log)
    db.session.commit()
    return jsonify(data=agent.to_dict(), message='Agent deployed'), 200


@agents_bp.route('/<agent_id>/pause', methods=['POST'])
@jwt_required()
def pause_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404
    if agent.status != 'active':
        return jsonify(error='Conflict', message='Only active agents can be paused'), 409

    agent.status = 'paused'
    _create_alert(user_id, agent.id, 'agent_paused', 'medium',
                  f'Agent "{agent.name}" paused', 'Trading has been suspended.')
    log = AuditLog(user_id=user_id, agent_id=agent.id, event_type='agent_paused', details={})
    db.session.add(log)
    db.session.commit()
    return jsonify(data=agent.to_dict(), message='Agent paused'), 200


@agents_bp.route('/<agent_id>/resume', methods=['POST'])
@jwt_required()
def resume_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404
    if agent.status != 'paused':
        return jsonify(error='Conflict', message='Only paused agents can be resumed'), 409

    agent.status = 'active'
    log = AuditLog(user_id=user_id, agent_id=agent.id, event_type='agent_resumed', details={})
    db.session.add(log)
    db.session.commit()
    return jsonify(data=agent.to_dict(), message='Agent resumed'), 200


@agents_bp.route('/<agent_id>/stop', methods=['POST'])
@jwt_required()
def stop_agent(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404
    if agent.status not in ('active', 'paused'):
        return jsonify(error='Conflict', message='Agent is not running'), 409

    agent.status = 'stopped'
    _create_alert(user_id, agent.id, 'agent_stopped', 'medium',
                  f'Agent "{agent.name}" stopped', 'All positions will be closed at next opportunity.')
    log = AuditLog(user_id=user_id, agent_id=agent.id, event_type='agent_stopped', details={})
    db.session.add(log)
    db.session.commit()
    return jsonify(data=agent.to_dict(), message='Agent stopped'), 200


# ── Sub-resources ─────────────────────────────────────────────────────────────

@agents_bp.route('/<agent_id>/trades', methods=['GET'])
@jwt_required()
def agent_trades(agent_id):
    user_id  = get_jwt_identity()
    agent    = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404

    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    pagination = (
        Trade.query.filter_by(agent_id=agent_id)
        .order_by(Trade.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    return jsonify(
        data=[t.to_dict() for t in pagination.items],
        total=pagination.total,
        page=page,
        page_size=per_page,
        total_pages=pagination.pages,
    ), 200


@agents_bp.route('/<agent_id>/logs', methods=['GET'])
@jwt_required()
def agent_logs(agent_id):
    user_id = get_jwt_identity()
    agent   = _own_agent(agent_id, user_id)
    if not agent:
        return jsonify(error='Not found', message='Agent not found'), 404

    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    pagination = (
        AuditLog.query.filter_by(agent_id=agent_id)
        .order_by(AuditLog.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    return jsonify(
        data=[l.to_dict() for l in pagination.items],
        total=pagination.total,
        page=page,
        page_size=per_page,
        total_pages=pagination.pages,
    ), 200


# ── Helper ────────────────────────────────────────────────────────────────────

def _create_alert(user_id, agent_id, alert_type, severity, title, message):
    alert = Alert(
        user_id=user_id,
        agent_id=agent_id,
        alert_type=alert_type,
        severity=severity,
        title=title,
        message=message,
    )
    db.session.add(alert)
