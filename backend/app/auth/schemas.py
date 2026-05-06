from marshmallow import Schema, fields, validate, validates, ValidationError


class SignupSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    company = fields.Str(load_default=None, validate=validate.Length(max=255))

    @validates('password')
    def validate_password(self, value, **kwargs):
        if not any(c.isupper() for c in value):
            raise ValidationError('Password must contain at least one uppercase letter.')
        if not any(c.isdigit() for c in value):
            raise ValidationError('Password must contain at least one number.')


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=1))


class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8))

    @validates('new_password')
    def validate_new_password(self, value, **kwargs):
        if not any(c.isupper() for c in value):
            raise ValidationError('Password must contain at least one uppercase letter.')
        if not any(c.isdigit() for c in value):
            raise ValidationError('Password must contain at least one number.')
