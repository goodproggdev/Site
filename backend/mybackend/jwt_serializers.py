"""
JWT: login con email + password (coerente con allauth ACCOUNT_LOGIN_METHODS=email).

Il TokenObtainPairSerializer standard espone il campo USERNAME_FIELD (es. username);
il client SPA invia invece { email, password }.
"""

from __future__ import annotations

import logging

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from allauth.account.models import EmailAddress

logger = logging.getLogger(__name__)


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

        # .get() qui andava in errore (500) se due utenti condividevano la stessa
        # email: il modello User di Django non impone un vincolo di unicita' sul
        # campo email (solo ACCOUNT_UNIQUE_EMAIL di allauth lo valida in fase di
        # registrazione via API, ma non blocca altre vie di creazione, es. shell/
        # script di provisioning). Con .filter().first() il login sceglie in modo
        # deterministico il record piu' vecchio invece di rompersi.
        matching_users = list(User.objects.filter(email__iexact=email).order_by("id"))
        if not matching_users:
            raise exceptions.AuthenticationFailed(
                self.error_messages["no_active_account"],
                "no_active_account",
            )
        if len(matching_users) > 1:
            logger.warning(
                "Piu' utenti con la stessa email in login (%s): uso il piu' vecchio (id=%s). "
                "Andrebbero deduplicati.",
                email, matching_users[0].pk,
            )
        user = matching_users[0]

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
