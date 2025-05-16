# backend/api/urls.py

from django.urls import path
# Importa la tua nuova view
from .views import ItemListCreate, get_json_data, match_resume, parse_cv_upload_view

urlpatterns = [
    path('items/', ItemListCreate.as_view(), name='item-list-create'),
    path('data/', get_json_data, name='get_json_data'),
    path('match-resume/', match_resume, name='match_resume'),
    # --- AGGIUNGI QUESTO NUOVO URL PATTERN ---
    path('parse-cv-upload/', parse_cv_upload_view, name='parse_cv_upload'),
]