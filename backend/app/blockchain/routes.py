import os
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.blockchain import blockchain_bp
from app.extensions import db
from app.models.mandate import Mandate
from app.models.audit_log import AuditLog


def _get_web3():
    """Lazy-import web3 so the app starts even if web3 is not installed."""
    try:
        from web3 import Web3
        rpc = os.environ.get('MANTLE_RPC_URL', 'https://rpc.mantle.xyz')
        w3  = Web3(Web3.HTTPProvider(rpc))
        return w3 if w3.is_connected() else None
    except ImportError:
        return None


@blockchain_bp.route('/submit-policy/<mandate_id>', methods=['POST'])
@jwt_required()
def submit_policy(mandate_id):
    """Post the mandate's policy_hash on-chain via the MandatePolicy contract."""
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404
    if not mandate.policy_hash:
        return jsonify(error='Bad request', message='Mandate has no policy hash — parse it first'), 400

    contract_address = os.environ.get('MANDATE_POLICY_CONTRACT')
    private_key      = os.environ.get('AGENT_PRIVATE_KEY')

    if not contract_address or not private_key:
        return jsonify(
            error='Not configured',
            message='MANDATE_POLICY_CONTRACT and AGENT_PRIVATE_KEY env vars required',
        ), 503

    w3 = _get_web3()
    if not w3:
        return jsonify(error='Blockchain unavailable', message='Cannot connect to Mantle RPC'), 503

    try:
        from web3 import Web3

        # Minimal ABI for submitPolicy(bytes32)
        abi = [{
            'inputs': [{'internalType': 'bytes32', 'name': 'policyHash', 'type': 'bytes32'}],
            'name': 'submitPolicy',
            'outputs': [],
            'stateMutability': 'nonpayable',
            'type': 'function',
        }]

        contract  = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)
        account   = w3.eth.account.from_key(private_key)
        hash_bytes = bytes.fromhex(mandate.policy_hash[2:])  # strip 0x

        tx = contract.functions.submitPolicy(hash_bytes).build_transaction({
            'from':  account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas':   100_000,
        })
        signed    = account.sign_transaction(tx)
        tx_hash   = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt   = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        tx_hex    = '0x' + tx_hash.hex()

        mandate.on_chain_tx = tx_hex
        log = AuditLog(
            user_id=user_id,
            event_type='policy_submitted_on_chain',
            tx_hash=tx_hex,
            block_number=receipt.blockNumber,
            details={'mandate_id': str(mandate.id), 'policy_hash': mandate.policy_hash},
        )
        db.session.add(log)
        db.session.commit()

        return jsonify(data={
            'tx_hash':      tx_hex,
            'block_number': receipt.blockNumber,
            'policy_hash':  mandate.policy_hash,
        }, message='Policy submitted on-chain'), 200

    except Exception as e:
        return jsonify(error='Transaction failed', message=str(e)), 500


@blockchain_bp.route('/verify-policy/<mandate_id>', methods=['GET'])
@jwt_required()
def verify_policy(mandate_id):
    """Check if the mandate's policy_hash is registered on-chain."""
    user_id = get_jwt_identity()
    mandate = Mandate.query.filter_by(id=mandate_id, user_id=user_id).first()
    if not mandate:
        return jsonify(error='Not found', message='Mandate not found'), 404

    if not mandate.on_chain_tx:
        return jsonify(data={'verified': False, 'tx_hash': None}), 200

    return jsonify(data={
        'verified':    True,
        'tx_hash':     mandate.on_chain_tx,
        'policy_hash': mandate.policy_hash,
    }), 200
