import pytest
from unittest.mock import patch, MagicMock
from ai.mandate_parser import parse_mandate, hash_policy, _apply_defaults, MandateParseError


class TestApplyDefaults:
    def test_missing_keys_are_filled(self):
        policy = _apply_defaults({'asset': 'BTC'})
        assert policy['base_currency'] == 'USDC'
        assert policy['max_drawdown'] == 0.15
        assert policy['venue'] == 'auto'

    def test_existing_keys_not_overwritten(self):
        policy = _apply_defaults({'risk_per_trade': 0.10, 'venue': 'agni'})
        assert policy['risk_per_trade'] == 0.10
        assert policy['venue'] == 'agni'


class TestHashPolicy:
    def test_hash_format(self):
        policy = _apply_defaults({'asset': 'ETH'})
        h = hash_policy(policy)
        assert h.startswith('0x')
        assert len(h) == 66  # 0x + 64 hex chars = 32 bytes

    def test_hash_is_deterministic(self):
        policy = _apply_defaults({'asset': 'ETH', 'risk_per_trade': 0.05})
        assert hash_policy(policy) == hash_policy(policy)

    def test_different_policies_produce_different_hashes(self):
        p1 = _apply_defaults({'asset': 'ETH'})
        p2 = _apply_defaults({'asset': 'BTC'})
        assert hash_policy(p1) != hash_policy(p2)


class TestParseMandateMocked:
    """Tests that mock the Anthropic API call — no real API key needed."""

    def _make_response(self, json_text: str):
        msg = MagicMock()
        msg.content = [MagicMock(text=json_text)]
        return msg

    @patch('ai.mandate_parser._get_client')
    def test_parses_simple_mandate(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.messages.create.return_value = self._make_response(
            '{"asset":"ETH","trigger":"RSI_below_30","risk_per_trade":0.03,"direction":"buy"}'
        )

        policy = parse_mandate('Buy ETH when RSI drops below 30, risk 3%')
        assert policy['asset'] == 'ETH'
        assert policy['trigger'] == 'RSI_below_30'
        assert policy['risk_per_trade'] == 0.03
        assert 'max_drawdown' in policy  # defaults applied

    @patch('ai.mandate_parser._get_client')
    def test_strips_markdown_fences(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.messages.create.return_value = self._make_response(
            '```json\n{"asset":"MNT","trigger":"momentum_positive"}\n```'
        )

        policy = parse_mandate('Buy MNT on positive momentum')
        assert policy['asset'] == 'MNT'

    @patch('ai.mandate_parser._get_client')
    def test_raises_on_invalid_json(self, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.messages.create.return_value = self._make_response(
            'This is not JSON at all'
        )

        with pytest.raises(MandateParseError):
            parse_mandate('Some mandate')

    def test_raises_without_api_key(self):
        import os
        original = os.environ.pop('ANTHROPIC_API_KEY', None)
        import ai.mandate_parser as mp
        mp._client = None  # reset singleton

        with pytest.raises(RuntimeError, match='ANTHROPIC_API_KEY'):
            parse_mandate('Buy ETH')

        if original:
            os.environ['ANTHROPIC_API_KEY'] = original
        mp._client = None  # reset for other tests
