"""
Django settings for mybackend project — production-ready version.
Usa python-decouple per leggere i segreti da .env
"""

import os
from pathlib import Path
from decouple import config, Csv
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================================================================
# SICUREZZA
# ==============================================================================
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# ==============================================================================
# APPLICAZIONI INSTALLATE
# ==============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'dj_rest_auth',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    # Local
    'api',
]

if config('USE_S3_STORAGE', default=False, cast=bool):
    INSTALLED_APPS.append('storages')

SITE_ID = 1
# django.contrib.sites: usato da allauth nelle email (nome/dominio). Sincronizzato in api.apps.
SITE_NAME = config('SITE_NAME', default='Nordevit')
SITE_DOMAIN = config('SITE_DOMAIN', default='localhost:8000')

# URL del frontend (Vite): email reset/conferme e link assoluti verso la SPA
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')
FRONTEND_DEFAULT_LANG = config('FRONTEND_DEFAULT_LANG', default='it')

# ==============================================================================
# JWT & REST FRAMEWORK
# ==============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/min',
        'user': '100/min',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'cv-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'cv-refresh-token',
    'JWT_AUTH_SECURE': not DEBUG,
    'JWT_AUTH_HTTPONLY': True,
    'JWT_AUTH_SAMESITE': 'Lax',
    'SESSION_LOGIN': False,
    'PASSWORD_RESET_SERIALIZER': 'api.auth_serializers.SpaPasswordResetSerializer',
}

# ==============================================================================
# ALLAUTH
# ==============================================================================
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
# Default: verifica obbligatoria anche in DEBUG (stesso flusso della produzione: niente JWT finché non confermi).
# Per saltare la verifica in locale: ACCOUNT_EMAIL_VERIFICATION=none nel .env
ACCOUNT_EMAIL_VERIFICATION = config('ACCOUNT_EMAIL_VERIFICATION', default='mandatory')
ACCOUNT_UNIQUE_EMAIL = True

# ==============================================================================
# MIDDLEWARE
# ==============================================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# ==============================================================================
# CORS
# ==============================================================================
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv(),
)

# URL del frontend (link conferma email da backend → React)
FRONTEND_BASE_URL = config('FRONTEND_BASE_URL', default='http://localhost:5173')

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG

# ==============================================================================
# URL & TEMPLATES
# ==============================================================================
ROOT_URLCONF = 'mybackend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'mybackend' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mybackend.wsgi.application'

# ==============================================================================
# DATABASE
# ==============================================================================
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# ==============================================================================
# PASSWORD VALIDATION
# ==============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==============================================================================
# EMAIL
# ==============================================================================
# In locale (DEBUG=True), le email vengono stampate nella console del server.
# Per vedere l'email di conferma: guarda il terminale dove gira 'python manage.py runserver'
# In produzione: configura SMTP reale tramite variabili d'ambiente
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@example.com')
EMAIL_RECIPIENT = config('EMAIL_RECIPIENT', default='admin@example.com')

# ==============================================================================
# STRIPE
# ==============================================================================
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

# ==============================================================================
# MEDIA & STATIC
# ==============================================================================
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

if config('USE_S3_STORAGE', default=False, cast=bool):
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='')
    AWS_S3_ENDPOINT_URL = config('AWS_S3_ENDPOINT_URL', default='')
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# ==============================================================================
# INTERNAZIONALIZZAZIONE
# ==============================================================================
LANGUAGE_CODE = 'it-it'
TIME_ZONE = 'Europe/Rome'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================================================================
# SICUREZZA HEADERS (production)
# ==============================================================================
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
