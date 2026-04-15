"""
JWT: login con email + password (coerente con allauth ACCOUNT_LOGIN_METHODS=email).

Il TokenObtainPairSerializer standard espone il campo USERNAME_FIELD (es. username);
il client SPA invia invece { email, password }.
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from allauth.account.models import EmailAddress


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Body atteso: { \"email\": \"...\", \"password\": \"...\" }."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        User = get_user_model()
        uf = User.USERNAME_FIELD
        if uf in self.fields:
            self.fields.pop(uf)
        self.fields["email"] = serializers.EmailField(write_only=True, label=_("Email"))

    def validate(self, attrs):
        User = get_user_model()
        email = attrs.pop("email", "")
        if isinstance(email, str):
            email = email.strip()
        if not email:
            raise serializers.ValidationError({"email": [_("This field may not be blank.")]})

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed(
                self.error_messages["no_active_account"],
                "no_active_account",
            )

        attrs[User.USERNAME_FIELD] = getattr(user, User.USERNAME_FIELD)
        data = super().validate(attrs)

        # Se esiste una EmailAddress allauth, richiedi verified=True (stesso vincolo della registrazione JWT).
        if EmailAddress.objects.filter(user=self.user).exists():
            if not EmailAddress.objects.filter(user=self.user, verified=True).exists():
                raise exceptions.AuthenticationFailed(
                    _("E-mail is not verified."),
                    "email_not_verified",
                )

        return data
