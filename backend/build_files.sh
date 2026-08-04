#!/bin/bash
# Script di build per Vercel (@vercel/static-build): installa le dipendenze
# "slim", applica le migrazioni Django sul database Postgres (Supabase),
# crea/aggiorna un superuser di test (se le variabili sono impostate) e
# genera i file statici (admin, DRF browsable API) che Vercel serve
# direttamente senza passare dalla funzione serverless Python.
#
# Le migrazioni girano qui (in fase di build) e non nella funzione serverless
# a runtime perche' la funzione serverless non ha un "prima esecuzione"
# affidabile in cui farlo una volta sola: ogni build invece e' un singolo
# processo lineare, quindi e' il posto giusto per applicare `migrate` prima
# che il traffico reale arrivi alla nuova versione.
set -e
echo "BUILD START (Vercel - backend Django)"
python3 -m pip install --break-system-packages -r requirements-vercel.txt
python3 manage.py migrate --noinput

# Superuser di test per /admin/: creato solo se DJANGO_SUPERUSER_PASSWORD e'
# impostato su Vercel (Settings -> Environment Variables). Idempotente: se
# esiste gia' un utente con quello username/email aggiorna solo la password,
# non fallisce mai il build (a differenza di 'createsuperuser --noinput' puro,
# che va in errore se l'utente esiste gia').
if [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Verifico/creo il superuser di test..."
  python3 manage.py shell -c "
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ['DJANGO_SUPERUSER_PASSWORD']

user, created = User.objects.get_or_create(
    username=username,
    defaults={'email': email, 'is_staff': True, 'is_superuser': True},
)
user.email = email
user.is_staff = True
user.is_superuser = True
user.set_password(password)
user.save()
print('Superuser creato.' if created else 'Superuser gia esistente: password aggiornata.')
"
else
  echo "DJANGO_SUPERUSER_PASSWORD non impostata: salto la creazione del superuser."
fi

python3 manage.py collectstatic --noinput --clear
echo "BUILD END"
