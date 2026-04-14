"""
URL di registrazione dj-rest-auth, con conferma email che redirige al frontend.

Evita il TemplateView vuoto di dj_rest_auth.registration.urls che causa
ImproperlyConfigured (manca template_name).
"""
from django.urls import path, re_path
from django.views.generic import TemplateView

from dj_rest_auth.registration.views import (
    RegisterView,
    VerifyEmailView,
    ResendEmailVerificationView,
)

from .auth_views import account_confirm_email_redirect

urlpatterns = [
    path("", RegisterView.as_view(), name="rest_register"),
    path("verify-email/", VerifyEmailView.as_view(), name="rest_verify_email"),
    path(
        "resend-email/",
        ResendEmailVerificationView.as_view(),
        name="rest_resend_email",
    ),
    re_path(
        r"^account-confirm-email/(?P<key>[-:\w]+)/$",
        account_confirm_email_redirect,
        name="account_confirm_email",
    ),
    path(
        "account-email-verification-sent/",
        TemplateView.as_view(template_name="account/email_verification_sent.html"),
        name="account_email_verification_sent",
    ),
]
