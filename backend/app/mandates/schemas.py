from marshmallow import Schema, fields, validate, validates, ValidationError


class MandateCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    mandate_text = fields.Str(required=True, validate=validate.Length(min=10, max=2000))
    base_currency = fields.Str(load_default='USDC', validate=validate.OneOf(['USDC', 'USDT', 'ETH', 'MNT']))
    strategy_type = fields.Str(load_default=None, validate=validate.Length(max=50))
    capital_cap = fields.Float(load_default=None, validate=validate.Range(min=0))
    risk_params = fields.Dict(load_default=dict)


class MandateUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=2, max=255))
    mandate_text = fields.Str(validate=validate.Length(min=10, max=2000))
    base_currency = fields.Str(validate=validate.OneOf(['USDC', 'USDT', 'ETH', 'MNT']))
    capital_cap = fields.Float(allow_none=True, validate=validate.Range(min=0))
    risk_params = fields.Dict()
    status = fields.Str(validate=validate.OneOf(['draft', 'active', 'paused', 'archived']))


class ParsePreviewSchema(Schema):
    mandate_text = fields.Str(required=True, validate=validate.Length(min=10, max=2000))
