from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.mandates import mandates_bp
from app.mandates.schemas import MandateCreateSchema, MandateUpdateSchema, ParsePreviewSchema
from app.extensions import db
from app.models.mandate import Mandate
from ai.mandate_parser import parse_mandate, hash_policy, MandateParseError


@mandates_bp.route('', methods=['GET'])
@jwt_required()
def list_mandates():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')

    query = Mandate.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Mandate.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        data=[m.to_dict() for m in pagination.items],
        total=pagination.total,
        page=page,
        page_size=per_page,
        total_pages=pagination.pages,
    ), 200


@mandates_bp.route('', methods=['POST'])
@jwt_required()
def create_mandate():
    user_id = get_jwt_identity()
    schema = MandateCreateSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    try:
        parsed_policy = parse_mandate(data['mandate_text'])
        policy_hash = hash_policy(parsed_policy)
    except Exception:
        parsed_policy = None
        policy_hash = None

    mandate = Mandate(
        user_id=user_id,
        name=data['name'],
        mandate_text=data['mandate_text'],
        base_currency=data.get('base_currency', 'USDC'),
        strategy_type=data.get('strategy_type'),
        capital_cap=data.get('capital_cap'),
        risk_params=data.get('risk_params', {}),
        parsed_policy=parsed_policy,
        policy_hash=policy_hash,
        status='draft',
    )
    db.session.add(mandate)
    db.session.commit()
    return jsonify(data=mandate.to_dict(), message='Mandate created'), 201


@mandates_bp.route('/<mandate_id>', methods=['GET'])
@jwt_required()
def get_mandate(mandate_id):
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404
    return jsonify(data=mandate.to_dict(), message='OK'), 200


@mandates_bp.route('/<mandate_id>', methods=['PUT'])
@jwt_required()
def update_mandate(mandate_id):
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404

    schema = MandateUpdateSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    for field, value in data.items():
        setattr(mandate, field, value)

    if 'mandate_text' in data:
        try:
            mandate.parsed_policy = parse_mandate(data['mandate_text'])
            mandate.policy_hash = hash_policy(mandate.parsed_policy)
        except Exception:
            pass

    db.session.commit()
    return jsonify(data=mandate.to_dict(), message='Mandate updated'), 200


@mandates_bp.route('/<mandate_id>', methods=['DELETE'])
@jwt_required()
def delete_mandate(mandate_id):
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404
    db.session.delete(mandate)
    db.session.commit()
    return jsonify(data=None, message='Mandate deleted'), 200


@mandates_bp.route('/parse-preview', methods=['POST'])
@jwt_required()
def parse_preview():
    """Parse plain-English text without saving — powers the live editor panel."""
    schema = ParsePreviewSchema()
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify(error='Validation failed', message=e.messages), 422

    try:
        policy = parse_mandate(data['mandate_text'])
        policy_hash = hash_policy(policy)
        return jsonify(data={'parsed_policy': policy, 'policy_hash': policy_hash}, message='OK'), 200
    except MandateParseError as e:
        return jsonify(error='Parse failed', message=str(e)), 422
    except RuntimeError as e:
        return jsonify(error='AI service unavailable', message=str(e)), 503


@mandates_bp.route('/<mandate_id>/parse', methods=['POST'])
@jwt_required()
def parse_mandate_endpoint(mandate_id):
    """Re-parse an existing mandate and update its stored policy + hash."""
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404

    try:
        mandate.parsed_policy = parse_mandate(mandate.mandate_text)
        mandate.policy_hash = hash_policy(mandate.parsed_policy)
        db.session.commit()
        return jsonify(
            data={'parsed_policy': mandate.parsed_policy, 'policy_hash': mandate.policy_hash},
            message='Mandate parsed',
        ), 200
    except MandateParseError as e:
        return jsonify(error='Parse failed', message=str(e)), 422
    except RuntimeError as e:
        return jsonify(error='AI service unavailable', message=str(e)), 503


@mandates_bp.route('/<mandate_id>/hash', methods=['GET'])
@jwt_required()
def get_mandate_hash(mandate_id):
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404
    return jsonify(data={'policy_hash': mandate.policy_hash, 'on_chain_tx': mandate.on_chain_tx}, message='OK'), 200
