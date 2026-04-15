"""
Accesso in lettura ai CV pubblici (slug + policy + token).
Usato dalla API JSON e dalla vista HTML per crawler (meta senza JS).
"""
from __future__ import annotations

from typing import Optional, Tuple

from api.models import CVData

from .cv_entitlements import user_has_paid_cv_hosting_access


def resolve_public_cv(slug: str, token: Optional[str]) -> Tuple[Optional[CVData], Optional[int]]:
    """
    Restituisce (cv, None) se accesso consentito.
    Altrimenti (None, http_status) con 404 o 403.
    """
    try:
        cv = CVData.objects.select_related("user").get(slug=slug)
    except CVData.DoesNotExist:
        return None, 404

    if not cv.is_published and not user_has_paid_cv_hosting_access(cv.user):
        return None, 404

    policy = getattr(cv, "link_policy", None)
    if policy:
        if not policy.is_accessible():
            return None, 403
        if policy.visibility == "private_tokenized":
            if not token or token != policy.access_token:
                return None, 403

    return cv, None
