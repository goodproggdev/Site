import os
import json

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.db import models
from .models import Item
from .serializers import ItemSerializer
from rest_framework import generics
import nltk
from django.http import JsonResponse
from .resume_matcher_service import process_resume, process_job_description, calculate_similarity

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
    
def match_resume(request):
    """
    API endpoint to match a resume against job descriptions.
    """
    resume_file = "Data/Processed/Resumes/sample_resume.json"
    job_desc_file = "Data/Processed/JobDescription/sample_jd.json"

    resume_data = process_resume(resume_file)
    job_desc_data = process_job_description(job_desc_file)

    similarity_score = calculate_similarity(resume_data["extracted_keywords"], job_desc_data["extracted_keywords"])

    response = {
        "resume_data": resume_data,
        "job_desc_data": job_desc_data,
        "similarity_score": similarity_score
    }

    return JsonResponse(response)