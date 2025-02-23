import os
import json

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db import models
from .models import Item
from .serializers import ItemSerializer
from rest_framework import generics

# Create your views here.

class ItemListCreate(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

def get_json_data(request):
# Adjust the path to the data.json file inside your api/data folder
    file_path = os.path.join(os.path.dirname(__file__), "data", "data.json")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File not found"}, status=404)