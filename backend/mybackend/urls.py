"""
URL configuration — aggiunto JWT auth endpoints e rimosso routing duplicato.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import analyze_cv, contact_view, upload_file

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # JWT Auth
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # dj-rest-auth (login, logout, password reset, registration)
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('mybackend.registration_urls')),

    # API v1
    path('api/v1/upload/', upload_file, name='upload_file_v1'),
    path('api/v1/analyze-cv/', analyze_cv, name='analyze-cv-v1'),
    path('api/v1/contact/', contact_view, name='contact-v1'),
    path('api/v1/', include('api.urls')),

    # Legacy API (deprecate and remove once clients are migrated)
    path('api/legacy/', include('api.legacy_urls')),
    path('upload/', upload_file, name='upload_file_legacy'),
    path('api/analyze-cv/', analyze_cv, name='analyze-cv-legacy'),
    path('api/contact/', contact_view, name='contact-legacy'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)