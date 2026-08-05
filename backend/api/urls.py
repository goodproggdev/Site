from django.urls import path

from .cv_public_html_views import cv_og_image_view
from .views import (
    CVDashboardView,
    CVDetailView,
    CVPublicView,
    CVUpdateView,
    # Entitlement & Link Policy
    check_entitlement,
    create_cv_draft_view,
    create_stripe_checkout_view,
    cv_extraction_kpi_view,
    cv_link_policy,
    delete_cv,
    # Job Matching
    get_job_matches,
    list_entitlements,
    match_resume,
    my_cv_list,
    parse_cv_upload_view,
    refresh_job_matches,
    regenerate_cv_token,
    revoke_cv_access,
    stripe_webhook_view,
    update_job_match_status,
)

urlpatterns = [
    # CV
    path('cv/', my_cv_list, name='my_cv_list'),
    path('cv/draft/', create_cv_draft_view, name='cv-draft'),
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
    path('cv/extraction-kpi/', cv_extraction_kpi_view, name='cv_extraction_kpi'),

    # Job Matching
    path('jobs/matches/', get_job_matches, name='get_job_matches'),
    path('jobs/refresh/', refresh_job_matches, name='refresh_job_matches'),
    path('jobs/matches/<uuid:match_id>/status/', update_job_match_status, name='update_job_match_status'),

    # Dashboard & CV Management Fase 4
    path('dashboard/', CVDashboardView.as_view(), name='cv-dashboard'),
    path('cv/public/<slug:slug>/', CVPublicView.as_view(), name='cv-public'),
    path('cv/<slug:slug>/og-image.png', cv_og_image_view, name='cv-og-image'),
    path('cv/update/<int:cv_id>/', CVUpdateView.as_view(), name='cv-update'),
    path('cv/<int:cv_id>/', CVDetailView.as_view(), name='cv-detail'),

    # Resume Matching
    path('match-resume/', match_resume, name='match_resume'),
]
