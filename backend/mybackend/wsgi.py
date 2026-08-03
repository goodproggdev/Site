"""
WSGI config for mybackend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
import sys

# Su un host tradizionale (manage.py runserver/gunicorn lanciato da dentro
# backend/) la cartella corrente e' gia' su sys.path e 'mybackend' si importa
# senza problemi. Il runtime Python serverless di Vercel invece esegue questo
# file direttamente (backend/mybackend/wsgi.py) senza settare backend/ come
# cwd/sys.path, quindi 'import mybackend.settings' falliva con
# "ModuleNotFoundError: No module named 'mybackend'". Aggiungendo qui la
# cartella backend/ (parent di questo file) funziona in entrambi i contesti.
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mybackend.settings')

application = get_wsgi_application()
