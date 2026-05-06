from marshmallow import Schema, fields, validate


class TradeFilterSchema(Schema):
    page       = fields.Int(load_default=1, validate=validate.Range(min=1))
    per_page   = fields.Int(load_default=20, validate=validate.Range(min=1, max=100))
    agent_id   = fields.UUID(load_default=None)
    mandate_id = fields.UUID(load_default=None)
    status     = fields.Str(load_default=None, validate=validate.OneOf(['pending', 'success', 'failed']))
    direction  = fields.Str(load_default=None, validate=validate.OneOf(['buy', 'sell']))
