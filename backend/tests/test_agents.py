"""Tests for /api/agents/* endpoints."""
import pytest
from unittest.mock import patch


@pytest.fixture()
def mandate_id(client, auth_headers):
    """Create a mandate and return its ID."""
    with patch('app.mandates.routes.parse_mandate') as mock_parse:
        mock_parse.return_value = {
            'asset': 'ETH', 'trigger': 'RSI_below_30',
            'risk_per_trade': 0.05, 'direction': 'buy',
            'policy_hash': '0xabc123', 'venue': 'auto',
        }
        resp = client.post('/api/mandates', json={
            'name': 'Test Mandate',
            'mandate_text': 'Buy ETH on RSI dip.',
            'base_currency': 'USDC',
            'capital_cap': 5000,
            'risk_params': {'max_drawdown': 0.10, 'max_position': 0.05, 'stop_loss': 0.03, 'max_positions': 5, 'cooldown_hours': 2},
        }, headers=auth_headers)
        return resp.get_json()['data']['id']


AGENT_PAYLOAD = lambda mid: {
    'name': 'Alpha Agent',
    'mandate_id': mid,
    'capital_cap': 5000,
}


class TestDeployAgent:
    def test_deploy_success(self, client, auth_headers, mandate_id):
        resp = client.post('/api/agents', json=AGENT_PAYLOAD(mandate_id), headers=auth_headers)
        assert resp.status_code == 201
        data = resp.get_json()['data']
        assert data['name'] == 'Alpha Agent'
        assert data['status'] in ('active', 'inactive', 'paused')

    def test_deploy_unauthenticated(self, client, mandate_id):
        resp = client.post('/api/agents', json=AGENT_PAYLOAD(mandate_id))
        assert resp.status_code == 401

    def test_deploy_missing_mandate(self, client, auth_headers):
        resp = client.post('/api/agents', json={
            'name': 'Bad Agent',
            'mandate_id': 'nonexistent-id',
            'capital_limit': 1000,
        }, headers=auth_headers)
        assert resp.status_code in (404, 422)


class TestListAgents:
    def test_list_returns_array(self, client, auth_headers):
        resp = client.get('/api/agents', headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json()['data'], list)

    def test_list_unauthenticated(self, client):
        resp = client.get('/api/agents')
        assert resp.status_code == 401


class TestGetAgent:
    def test_get_own_agent(self, client, auth_headers, mandate_id):
        create = client.post('/api/agents', json=AGENT_PAYLOAD(mandate_id), headers=auth_headers)
        agent_id = create.get_json()['data']['id']
        resp = client.get(f'/api/agents/{agent_id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['data']['id'] == agent_id

    def test_get_nonexistent(self, client, auth_headers):
        resp = client.get('/api/agents/doesnotexist-xyz', headers=auth_headers)
        assert resp.status_code == 404


class TestAgentActions:
    def _create_active_agent(self, client, auth_headers, mandate_id):
        create = client.post('/api/agents', json=AGENT_PAYLOAD(mandate_id), headers=auth_headers)
        agent_id = create.get_json()['data']['id']
        client.post(f'/api/agents/{agent_id}/deploy', headers=auth_headers)
        return agent_id

    def test_pause_agent(self, client, auth_headers, mandate_id):
        agent_id = self._create_active_agent(client, auth_headers, mandate_id)
        resp = client.post(f'/api/agents/{agent_id}/pause', headers=auth_headers)
        assert resp.status_code == 200

    def test_resume_agent(self, client, auth_headers, mandate_id):
        agent_id = self._create_active_agent(client, auth_headers, mandate_id)
        client.post(f'/api/agents/{agent_id}/pause', headers=auth_headers)
        resp = client.post(f'/api/agents/{agent_id}/resume', headers=auth_headers)
        assert resp.status_code == 200

    def test_stop_agent(self, client, auth_headers, mandate_id):
        agent_id = self._create_active_agent(client, auth_headers, mandate_id)
        resp = client.post(f'/api/agents/{agent_id}/stop', headers=auth_headers)
        assert resp.status_code == 200
