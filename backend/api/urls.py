from django.urls import path
from .views import ItemListCreate, get_json_data, match_resume

urlpatterns = [
    path('items/', ItemListCreate.as_view(), name='item-list-create'),
    path('data/', get_json_data, name='get_json_data'),
    path('match-resume/', match_resume, name='match_resume'),
]