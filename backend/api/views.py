from django.shortcuts import render
from django.http import HttpResponse
from django.db import models
from .models import Item
from .serializers import ItemSerializer
from rest_framework import generics

# Create your views here.

class ItemListCreate(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer