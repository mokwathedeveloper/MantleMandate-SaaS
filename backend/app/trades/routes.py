from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.trades import trades_bp
from app.trades.schemas import TradeFilterSchema
from app.extensions import db
from app.models.trade import Trade


@trades_bp.route('', methods=['GET'])
@jwt_required()
def list_trades():
    user_id = get_jwt_identity()
    schema  = TradeFilterSchema()
    try:
        params = schema.load(request.args)
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    query = Trade.query.filter_by(user_id=user_id)
    if params.get('agent_id'):
        query = query.filter_by(agent_id=str(params['agent_id']))
    if params.get('mandate_id'):
        query = query.filter_by(mandate_id=str(params['mandate_id']))
    if params.get('status'):
        query = query.filter_by(status=params['status'])
    if params.get('direction'):
        query = query.filter_by(direction=params['direction'])

    query      = query.order_by(Trade.created_at.desc())
    pagination = query.paginate(page=params['page'], per_page=params['per_page'], error_out=False)

    return jsonify(
        data=[t.to_dict() for t in pagination.items],
        total=pagination.total,
        page=params['page'],
        page_size=params['per_page'],
        total_pages=pagination.pages,
    ), 200


@trades_bp.route('/<trade_id>', methods=['GET'])
@jwt_required()
def get_trade(trade_id):
    user_id = get_jwt_identity()
    trade   = Trade.query.filter_by(id=trade_id, user_id=user_id).first()
    if not trade:
        return jsonify(error='Not found', message='Trade not found'), 404
    return jsonify(data=trade.to_dict()), 200
