"""Collega l'utente Django (JWT) al modello applicativo UserProfile."""

from __future__ import annotations

from typing import Optional

from .models import UserProfile


def get_cv_owner_profile(request) -> Optional[UserProfile]:
    """
    I modelli CV (CVData, Entitlement, JobProfile, …) usano ForeignKey verso UserProfile.
    SimpleJWT espone invece django.contrib.auth.models.User: qui allineiamo i due mondi.
    """
    actor = request.user
    if isinstance(actor, UserProfile):
        return actor
    if not getattr(actor, "is_authenticated", False):
        return None
    email = (getattr(actor, "email", None) or "").strip().lower()
    if not email:
        return None
    profile, _ = UserProfile.objects.get_or_create(
        email=email,
        defaults={
            "first_name": getattr(actor, "first_name", "") or "",
            "last_name": getattr(actor, "last_name", "") or "",
        },
    )
    return profile
