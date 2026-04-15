"""
Crea (o aggiorna) un utente locale per login JWT + allauth.
Uso: dalla cartella backend/
  .venv\\Scripts\\python scripts/create_local_dev_user.py
"""
from __future__ import annotations

import os
import sys

# Aggiungi la root del backend al path
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mybackend.settings")

import django  # noqa: E402

django.setup()

from django.contrib.auth.models import User  # noqa: E402
from allauth.account.models import EmailAddress  # noqa: E402

# Credenziali solo per sviluppo locale (non usare in produzione)
DEV_EMAIL = "dev@nordevit.local"
DEV_PASSWORD = "NordevitDev2024!"
DEV_USERNAME = "dev_nordevit_local"


def main() -> None:
    user = User.objects.filter(email__iexact=DEV_EMAIL).first()
    if user is None:
        user = User.objects.create_user(
            username=DEV_USERNAME,
            email=DEV_EMAIL,
            password=DEV_PASSWORD,
            is_active=True,
        )
        created = True
    else:
        created = False
        user.is_active = True
        user.set_password(DEV_PASSWORD)
        user.save(update_fields=["password", "is_active"])

    EmailAddress.objects.update_or_create(
        user=user,
        email=DEV_EMAIL.lower(),
        defaults={"primary": True, "verified": True},
    )

    action = "creato" if created else "aggiornato"
    print(f"Utente {action}: email={DEV_EMAIL} username={user.username}")
    print("Password (solo dev):", DEV_PASSWORD)


if __name__ == "__main__":
    main()
