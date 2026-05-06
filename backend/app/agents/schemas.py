from marshmallow import Schema, fields, validate


class AgentCreateSchema(Schema):
    name          = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    mandate_id    = fields.UUID(required=True)
    wallet_id     = fields.UUID(load_default=None)
    capital_cap   = fields.Float(load_default=None, validate=validate.Range(min=0))


class AgentUpdateSchema(Schema):
    name        = fields.Str(validate=validate.Length(min=2, max=255))
    capital_cap = fields.Float(allow_none=True, validate=validate.Range(min=0))
