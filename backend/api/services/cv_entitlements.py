"""Controlli entitlement / piano per pubblicazione e hosting CV."""
from __future__ import annotations

from django.db.models import Q
from django.utils import timezone

from api.models import Entitlement


def user_has_active_cv_publish_entitlement(user) -> bool:
    """True se il profilo ha diritto di pubblicazione CV ancora valido (abbonamento / pagamento)."""
    if user is None:
        return False
    now = timezone.now()
    return Entitlement.objects.filter(
        user=user,
        feature="cv_publish",
        is_active=True,
    ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now)).exists()


def user_has_paid_cv_hosting_access(user) -> bool:
    """
    Accesso hosting CV pubblico oltre a `is_published`: entitlement Stripe o piano Pro/Enterprise
    (il webhook può impostare anche `premium` nei metadati).
    """
    if user is None:
        return False
    if user_has_active_cv_publish_entitlement(user):
        return True
    plan = str(getattr(user, "plan", "free") or "free").lower()
    return plan in ("pro", "enterprise", "premium")
