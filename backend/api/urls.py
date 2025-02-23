from django.urls import path
from .views import ItemListCreate, get_json_data

urlpatterns = [
    path('items/', ItemListCreate.as_view(), name='item-list-create'),
    path('data/', get_json_data, name='get_json_data')

]