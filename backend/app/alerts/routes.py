from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.alerts import alerts_bp
from app.extensions import db
from app.models.alert import Alert


@alerts_bp.route('', methods=['GET'])
@jwt_required()
def list_alerts():
    user_id  = get_jwt_identity()
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    unread   = request.args.get('unread', type=lambda v: v.lower() == 'true')

    query = Alert.query.filter_by(user_id=user_id)
    if unread:
        query = query.filter_by(is_read=False)
    pagination = query.order_by(Alert.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify(
        data=[a.to_dict() for a in pagination.items],
        total=pagination.total,
        unread_count=Alert.query.filter_by(user_id=user_id, is_read=False).count(),
    ), 200


@alerts_bp.route('/<alert_id>/read', methods=['POST'])
@jwt_required()
def mark_read(alert_id):
    user_id = get_jwt_identity()
    alert   = Alert.query.filter_by(id=alert_id, user_id=user_id).first()
    if not alert:
        return jsonify(error='Not found', message='Alert not found'), 404
    alert.is_read = True
    db.session.commit()
    return jsonify(data=alert.to_dict(), message='Alert marked as read'), 200


@alerts_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Alert.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify(data=None, message='All alerts marked as read'), 200
