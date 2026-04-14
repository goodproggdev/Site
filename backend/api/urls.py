from django.urls import path
from .views import (
    match_resume,
    parse_cv_upload_view,
    my_cv_list,
    delete_cv,
    create_stripe_checkout_view,
    stripe_webhook_view,
    CVDashboardView,
    CVPublicView,
    CVUpdateView,
    # Entitlement & Link Policy
    check_entitlement,
    list_entitlements,
    cv_link_policy,
    regenerate_cv_token,
    revoke_cv_access,
    # Job Matching
    get_job_matches,
    refresh_job_matches,
    update_job_match_status,
    api_v1_root,
)

urlpatterns = [
    # API v1 Root
    path('', api_v1_root, name='api_v1_root'),

    # CV
    path('cv/', my_cv_list, name='my_cv_list'),
    path('cv/<int:cv_id>/delete/', delete_cv, name='delete_cv'),
    path('parse-cv-upload/', parse_cv_upload_view, name='parse_cv_upload'),

    # Pagamenti Stripe
    path('stripe/create-checkout/', create_stripe_checkout_view, name='stripe-checkout'),
    path('stripe/webhook/', stripe_webhook_view, name='stripe-webhook'),

    # Entitlement
    path('entitlements/', list_entitlements, name='list_entitlements'),
    path('entitlements/<str:feature>/check/', check_entitlement, name='check_entitlement'),

    # CV Link Policy
    path('cv/<int:cv_id>/link-policy/', cv_link_policy, name='cv_link_policy'),
    path('cv/<int:cv_id>/regenerate-token/', regenerate_cv_token, name='regenerate_cv_token'),
    path('cv/<int:cv_id>/revoke/', revoke_cv_access, name='revoke_cv_access'),

    # Job Matching
    path('jobs/matches/', get_job_matches, name='get_job_matches'),
    path('jobs/refresh/', refresh_job_matches, name='refresh_job_matches'),
    path('jobs/matches/<uuid:match_id>/status/', update_job_match_status, name='update_job_match_status'),

    # Dashboard & CV Management Fase 4
    path('dashboard/', CVDashboardView.as_view(), name='cv-dashboard'),
    path('cv/public/<slug:slug>/', CVPublicView.as_view(), name='cv-public'),
    path('cv/update/<int:cv_id>/', CVUpdateView.as_view(), name='cv-update'),

    # Resume Matching
    path('match-resume/', match_resume, name='match_resume'),
]
