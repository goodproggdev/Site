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

# backend/api/views.py

import os
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.files.uploadedfile import UploadedFile

# ... (mantieni tutte le importazioni esistenti in views.py)
# es: from django.shortcuts import render, etc.
# es: from .models import Item, etc.
# es: from rest_framework import generics, etc.
# es: from .resume_matcher_service import ..., etc.


# --- Importa le funzioni dal tuo script demo_resume_parser.py ---
# Poiché demo_resume_parser.py è nella radice del progetto, importalo direttamente.
try:
    from demo_resume_parser import (
        extract_text_from_file,
        extract_with_resume_parser_en,
        extract_with_spacy_italian_improved,
        map_extracted_data_to_template,
        originalJsonStructure, # Importa la struttura template dal tuo script
        nlp_en, nlp_it, RESUME_PARSER_AVAILABLE # Importa anche questi se necessario
    )
    print("Importazione da demo_resume_parser.py (radice progetto) riuscita.")
    PARSING_FUNCTIONS_LOADED = True
except ImportError as e:
     print(f"ERRORE: Impossibile importare da demo_resume_parser.py: {e}")
     print("Assicurati che demo_resume_parser.py si trovi nella radice del progetto (allo stesso livello di manage.py) e che le dipendenze siano installate.")
     PARSING_FUNCTIONS_LOADED = False
except Exception as e:
     print(f"ERRORE imprevisto durante l'importazione da demo_resume_parser.py: {e}")
     PARSING_FUNCTIONS_LOADED = False


# --- Nuova View per il Parsing del CV ---

# @csrf_exempt disabilita la protezione CSRF solo per questa view (OK per API, usa token in produzione).
# @require_POST assicura che la view risponda solo a richieste POST.
@csrf_exempt
@require_POST
def parse_cv_upload_view(request): # Ho cambiato il nome per non confonderlo con match_resume
    print("Richiesta POST /api/parse-cv-upload/ ricevuta.") # Log di debug

    # Controlla se le funzioni di parsing sono state caricate correttamente
    if not PARSING_FUNCTIONS_LOADED:
         return JsonResponse({"error": "Backend parser non disponibile. Controllare i log del server."}, status=500)


    # Verifica se la richiesta contiene un file chiamato 'cv_file'
    if 'cv_file' not in request.FILES:
        print("Nessun file 'cv_file' trovato nella richiesta.") # Log di debug
        return JsonResponse({"error": "Nessun file CV caricato."}, status=400)

    cv_file: UploadedFile = request.FILES['cv_file']

    # Gestisci il file caricato salvandolo temporaneamente
    temp_path = None # Inizializza a None per la gestione dell'errore
    try:
        # Crea un file temporaneo
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(cv_file.name)[1]) as tmp_file:
            for chunk in cv_file.chunks():
                tmp_file.write(chunk)
            temp_path = tmp_file.name

        print(f"File temporaneo creato: {temp_path}") # Log di debug

        # --- Esegui la logica di parsing e mapping ---

        # Assicurati che le funzioni necessarie siano disponibili
        if 'extract_text_from_file' not in globals() or \
           'extract_with_resume_parser_en' not in globals() or \
           'extract_with_spacy_italian_improved' not in globals() or \
           'map_extracted_data_to_template' not in globals() or \
           'originalJsonStructure' not in globals():
             # Questo caso dovrebbe essere catturato da NOT PARSING_FUNCTIONS_LOADED, ma aggiungiamo un doppio controllo
             if temp_path and os.path.exists(temp_path): os.remove(temp_path)
             print("ERRORE: Funzioni di parsing o template JSON non disponibili.")
             return JsonResponse({"error": "Errore interno del server: Funzionalità di parsing non caricata."}, status=500)


        cv_text = extract_text_from_file(temp_path)

        if cv_text is None:
             error_payload = {"error": "Estrazione testo dal file fallita (formato non supportato o contenuto illeggibile)."}
             mapped_data = map_extracted_data_to_template(error_payload, error_payload, originalJsonStructure)
             if temp_path and os.path.exists(temp_path): os.remove(temp_path)
             return JsonResponse(mapped_data, status=200) # Restituisci 200 con l'errore nel corpo JSON


        extracted_data_en = {"error": "Parser inglese non disponibile."}
        if 'extract_with_resume_parser_en' in globals():
             extracted_data_en = extract_with_resume_parser_en(temp_path)

        extracted_data_it = {"error": "Parser italiano non disponibile."}
        if 'extract_with_spacy_italian_improved' in globals():
             extracted_data_it = extract_with_spacy_italian_improved(cv_text)


        # Pulisci il file temporaneo subito dopo l'uso da parte dei parser
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"File temporaneo '{temp_path}' rimosso.")


        # Mappa i dati estratti nel template JSON
        mapped_data = map_extracted_data_to_template(extracted_data_en, extracted_data_it, originalJsonStructure)

        print("Parsing completato. Invio risposta JSON.")
        # Restituisci il JSON popolato come risposta al frontend
        return JsonResponse(mapped_data)

    except Exception as e:
        # Gestione errori generici che potrebbero verificarsi durante il processo
        print(f"Errore durante l'elaborazione del file CV: {str(e)}") # Log di errore

        # Assicurati di pulire il file temporaneo anche in caso di eccezioni
        if temp_path and os.path.exists(temp_path):
             os.remove(temp_path)
             print(f"File temporaneo '{temp_path}' rimosso dopo eccezione.")

        return JsonResponse({"error": f"Errore interno del server durante il parsing del CV: {str(e)}"}, status=500)

# ... (mantieni tutte le altre views come ItemListCreate, get_json_data, match_resume)