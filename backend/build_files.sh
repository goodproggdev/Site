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

# Superuser di test per /admin/ (e per il login normale via /auth/token/, dato
# che e' un utente Django come un altro): creato solo se DJANGO_SUPERUSER_PASSWORD
# e' impostato su Vercel (Settings -> Environment Variables). Idempotente e
# non fallisce mai il build (a differenza di 'createsuperuser --noinput' puro).
#
# Dedup: il modello User di Django non impone un vincolo di unicita' sul campo
# email (solo la registrazione via API lo valida, non altre vie di creazione
# come questo script), quindi se esiste gia' un altro utente con la stessa
# email (es. auto-registrato dal sito) il login andava in errore 500
# (User.MultipleObjectsReturned). Qui teniamo un solo utente per quella email:
# quello gia' esistente piu' vecchio, se c'e', altrimenti ne creiamo uno nuovo;
# eliminiamo eventuali duplicati piu' recenti. Marchiamo inoltre l'email come
# verificata lato allauth, altrimenti il login la rifiuta comunque (mandatory).
if [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Verifico/creo il superuser di test..."
  python3 manage.py shell -c "
import os
from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ['DJANGO_SUPERUSER_PASSWORD']

existing = list(User.objects.filter(email__iexact=email).order_by('id'))
if existing:
    user = existing[0]
    dupes = existing[1:]
    if dupes:
        print(f'Trovati {len(dupes)} account duplicati con la stessa email: li elimino, tengo id={user.pk}.')
        for dupe in dupes:
            dupe.delete()
    created = False
else:
    user = User.objects.create(username=username, email=email)
    created = True

user.username = username
user.email = email
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.set_password(password)
user.save()

EmailAddress.objects.filter(user=user).exclude(email__iexact=email).delete()
addr, _ = EmailAddress.objects.get_or_create(user=user, defaults={'email': email})
addr.email = email
addr.verified = True
addr.primary = True
addr.save()

print('Superuser creato.' if created else 'Superuser gia esistente: aggiornato (password, email verificata).')
"
else
  echo "DJANGO_SUPERUSER_PASSWORD non impostata: salto la creazione del superuser."
fi

python3 manage.py collectstatic --noinput --clear
echo "BUILD END"
