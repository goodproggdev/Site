"""
Serializer dj-rest-auth: link reset password punta al frontend SPA (uid + token in query).
"""
from urllib.parse import urlencode

from django.conf import settings
from dj_rest_auth.serializers import PasswordResetSerializer
from allauth.account.utils import user_pk_to_url_str


def spa_password_reset_url_generator(request, user, temp_key):
    """URL assoluto verso la pagina React che invierà POST a /auth/password/reset/confirm/."""
    base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    lang = getattr(settings, 'FRONTEND_DEFAULT_LANG', 'it')
    uid = user_pk_to_url_str(user)
    query = urlencode({'uid': uid, 'token': temp_key})
    return f'{base}/{lang}/reset-password?{query}'


class SpaPasswordResetSerializer(PasswordResetSerializer):
    def get_email_options(self):
        opts = super().get_email_options()
        opts['url_generator'] = spa_password_reset_url_generator
        return opts
