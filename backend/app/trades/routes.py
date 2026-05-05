from flask import jsonify
from flask_jwt_extended import jwt_required
from app.trades import trades_bp


@trades_bp.route('', methods=['GET'])
@jwt_required()
def index():
    # TODO: implement
    return jsonify(data=[]), 200
