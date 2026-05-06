"""Tests for /api/mandates/* endpoints."""
import pytest
from unittest.mock import patch


MANDATE_PAYLOAD = {
    'name': 'Conservative ETH Buyer',
    'mandate_text': 'Buy ETH when RSI drops below 30. Max 5% of portfolio per trade.',
    'base_currency': 'USDC',
    'capital_cap': 10000,
    'risk_params': {
        'max_drawdown': 0.15,
        'max_position': 0.05,
        'stop_loss': 0.03,
        'max_positions': 10,
        'cooldown_hours': 4,
    },
}


class TestCreateMandate:
    @patch('app.mandates.routes.parse_mandate')
    def test_create_success(self, mock_parse, client, auth_headers):
        mock_parse.return_value = {
            'asset': 'ETH', 'trigger': 'RSI_below_30',
            'risk_per_trade': 0.05, 'direction': 'buy',
            'policy_hash': '0xabc123', 'venue': 'auto',
        }
        resp = client.post('/api/mandates', json=MANDATE_PAYLOAD, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.get_json()['data']
        assert data['name'] == MANDATE_PAYLOAD['name']
        assert data['status'] == 'draft'

    def test_create_unauthenticated(self, client):
        resp = client.post('/api/mandates', json=MANDATE_PAYLOAD)
        assert resp.status_code == 401

    def test_create_missing_name(self, client, auth_headers):
        payload = {**MANDATE_PAYLOAD, 'name': ''}
        resp = client.post('/api/mandates', json=payload, headers=auth_headers)
        assert resp.status_code == 422

    def test_create_missing_mandate_text(self, client, auth_headers):
        payload = {k: v for k, v in MANDATE_PAYLOAD.items() if k != 'mandate_text'}
        resp = client.post('/api/mandates', json=payload, headers=auth_headers)
        assert resp.status_code == 422


class TestListMandates:
    def test_list_empty(self, client, auth_headers):
        resp = client.get('/api/mandates', headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json()['data'], list)

    def test_list_unauthenticated(self, client):
        resp = client.get('/api/mandates')
        assert resp.status_code == 401


class TestGetMandate:
    @patch('app.mandates.routes.parse_mandate')
    def test_get_own_mandate(self, mock_parse, client, auth_headers):
        mock_parse.return_value = {'asset': 'ETH', 'trigger': 'RSI_below_30', 'risk_per_trade': 0.05, 'direction': 'buy', 'policy_hash': '0xabc', 'venue': 'auto'}
        create_resp = client.post('/api/mandates', json=MANDATE_PAYLOAD, headers=auth_headers)
        mandate_id = create_resp.get_json()['data']['id']
        resp = client.get(f'/api/mandates/{mandate_id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['data']['id'] == mandate_id

    def test_get_nonexistent(self, client, auth_headers):
        resp = client.get('/api/mandates/nonexistent-id-xyz', headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateMandate:
    @patch('app.mandates.routes.parse_mandate')
    def test_update_name(self, mock_parse, client, auth_headers):
        mock_parse.return_value = {'asset': 'ETH', 'trigger': 'RSI_below_30', 'risk_per_trade': 0.05, 'direction': 'buy', 'policy_hash': '0xabc', 'venue': 'auto'}
        create_resp = client.post('/api/mandates', json=MANDATE_PAYLOAD, headers=auth_headers)
        mandate_id = create_resp.get_json()['data']['id']
        resp = client.put(f'/api/mandates/{mandate_id}', json={'name': 'Updated Name'}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['data']['name'] == 'Updated Name'


class TestDeleteMandate:
    @patch('app.mandates.routes.parse_mandate')
    def test_delete_own_mandate(self, mock_parse, client, auth_headers):
        mock_parse.return_value = {'asset': 'ETH', 'trigger': 'RSI_below_30', 'risk_per_trade': 0.05, 'direction': 'buy', 'policy_hash': '0xabc', 'venue': 'auto'}
        create_resp = client.post('/api/mandates', json=MANDATE_PAYLOAD, headers=auth_headers)
        mandate_id = create_resp.get_json()['data']['id']
        resp = client.delete(f'/api/mandates/{mandate_id}', headers=auth_headers)
        assert resp.status_code in (200, 204)
