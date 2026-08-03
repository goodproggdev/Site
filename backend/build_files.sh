#!/bin/bash
# Script di build per Vercel (@vercel/static-build): installa le dipendenze
# "slim", applica le migrazioni Django sul database Postgres (Supabase) e
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
python3 manage.py collectstatic --noinput --clear
echo "BUILD END"
