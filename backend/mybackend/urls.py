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
    path('auth/registration/', include('dj_rest_auth.registration.urls')),

    # Upload & analyze CV
    path('upload/', upload_file, name='upload_file'),
    path('api/analyze-cv/', analyze_cv, name='analyze-cv'),
    path('api/contact/', contact_view, name='contact'),

    # API principale
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)