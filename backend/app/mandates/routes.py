from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.mandates import mandates_bp
from ai.mandate_parser import parse_mandate, hash_policy, MandateParseError


@mandates_bp.route('', methods=['GET'])
@jwt_required()
def list_mandates():
    # TODO: query DB, paginate
    return jsonify(data=[]), 200


@mandates_bp.route('', methods=['POST'])
@jwt_required()
def create_mandate():
    user_id = get_jwt_identity()
    data = request.get_json()
    # TODO: marshmallow schema validation, save to DB
    return jsonify(message='Mandate created', user_id=user_id), 201


@mandates_bp.route('/<mandate_id>', methods=['GET'])
@jwt_required()
def get_mandate(mandate_id):
    # TODO: query DB
    return jsonify(id=mandate_id), 200


@mandates_bp.route('/<mandate_id>', methods=['PUT'])
@jwt_required()
def update_mandate(mandate_id):
    # TODO: validate + update DB
    return jsonify(id=mandate_id), 200


@mandates_bp.route('/<mandate_id>', methods=['DELETE'])
@jwt_required()
def delete_mandate(mandate_id):
    # TODO: delete from DB
    return jsonify(message='Deleted'), 200


@mandates_bp.route('/<mandate_id>/parse', methods=['POST'])
@jwt_required()
def parse_mandate_endpoint(mandate_id):
    """
    Parse the mandate's plain-English text into a structured policy using Claude.
    Returns the parsed policy JSON and its SHA-256 hash (for on-chain registration).
    """
    data = request.get_json()
    mandate_text = data.get('mandate_text', '').strip()

    if not mandate_text:
        return jsonify(error='mandate_text is required'), 400

    try:
        policy = parse_mandate(mandate_text)
        policy_hash = hash_policy(policy)
        return jsonify(
            mandate_id=mandate_id,
            parsed_policy=policy,
            policy_hash=policy_hash,
        ), 200
    except MandateParseError as exc:
        return jsonify(error='Failed to parse mandate', detail=str(exc)), 422
    except RuntimeError as exc:
        return jsonify(error='AI service unavailable', detail=str(exc)), 503


@mandates_bp.route('/<mandate_id>/hash', methods=['GET'])
@jwt_required()
def get_mandate_hash(mandate_id):
    """
    Return the stored on-chain policy hash for an existing parsed mandate.
    TODO: fetch parsed_policy from DB and re-hash.
    """
    # TODO: load from DB
    return jsonify(mandate_id=mandate_id, policy_hash=None), 200
