import json
import nltk
import os
from scripts.similarity.get_score import get_score

def read_json(filepath):
    """Reads and returns JSON data from a given file."""
    with open(filepath, "r") as f:
        return json.load(f)

def process_resume(resume_path):
    """Extracts resume details and keywords."""
    resume_data = read_json(resume_path)
    return {
        "clean_data": resume_data["clean_data"],
        "extracted_keywords": resume_data["extracted_keywords"],
        "keyterms": resume_data["keyterms"]
    }

def process_job_description(jd_path):
    """Extracts job description details and keywords."""
    jd_data = read_json(jd_path)
    return {
        "clean_data": jd_data["clean_data"],
        "extracted_keywords": jd_data["extracted_keywords"],
        "keyterms": jd_data["keyterms"]
    }

def calculate_similarity(resume_keywords, jd_keywords):
    """Computes similarity score between a resume and job description."""
    resume_string = " ".join(resume_keywords)
    jd_string = " ".join(jd_keywords)
    result = get_score(resume_string, jd_string)
    return round(result[0].score * 100, 2)
