from django.urls import path
from .views import (
    ItemListCreate,
    get_json_data,
    match_resume,
    parse_cv_upload_view,
    my_cv_list,
    delete_cv,
    create_stripe_checkout_view,
    stripe_webhook_view,
    CVDashboardView,
    CVPublicView,
    CVUpdateView,
)

urlpatterns = [
    # Legacy
    path('items/', ItemListCreate.as_view(), name='item-list-create'),
    path('data/', get_json_data, name='get_json_data'),

    # CV
    path('cv/', my_cv_list, name='my_cv_list'),
    path('cv/<int:cv_id>/delete/', delete_cv, name='delete_cv'),
    path('parse-cv-upload/', parse_cv_upload_view, name='parse_cv_upload'),

    # Pagamenti Stripe
    path('stripe/create-checkout/', create_stripe_checkout_view, name='stripe-checkout'),
    path('stripe/webhook/', stripe_webhook_view, name='stripe-webhook'),

    # Dashboard & CV Management Fase 4
    path('dashboard/', CVDashboardView.as_view(), name='cv-dashboard'),
    path('cv/public/<slug:slug>/', CVPublicView.as_view(), name='cv-public'),
    path('cv/update/<int:cv_id>/', CVUpdateView.as_view(), name='cv-update'),

    # Resume Matching
    path('match-resume/', match_resume, name='match_resume'),
]