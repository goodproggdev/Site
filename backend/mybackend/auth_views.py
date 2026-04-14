"""
Redirect per conferma email (dj-rest-auth / allauth).

Il link nell'email punta a /auth/registration/account-confirm-email/<key>/
(django-allauth). La conferma reale è POST /auth/registration/verify-email/ con {key}.
Il frontend (VerifyEmail) legge ?token= e fa POST: qui rediriamo al frontend.
"""
import logging
from urllib.parse import urlencode

from django.conf import settings
from django.http import HttpResponseRedirect

logger = logging.getLogger(__name__)


def account_confirm_email_redirect(request, key: str):
    """GET dal link email → redirect al frontend con token (la chiave allauth)."""
    base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
    lang = request.GET.get("lang") or "it"
    qs = urlencode({"token": key})
    url = f"{base}/{lang}/verify-email?{qs}"
    logger.info("Redirect conferma email verso frontend: lang=%s", lang)
    return HttpResponseRedirect(url)
