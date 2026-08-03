#!/bin/bash
# Script di build per Vercel (@vercel/static-build): installa le dipendenze
# "slim" e genera i file statici di Django (admin, DRF browsable API) che
# Vercel serve direttamente senza passare dalla funzione serverless Python.
set -e
echo "BUILD START (Vercel - backend Django)"
python3 -m pip install --break-system-packages -r requirements-vercel.txt
python3 manage.py collectstatic --noinput --clear
echo "BUILD END"
