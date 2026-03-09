"""
API Views — refactored
La logica di business è stata spostata in api/services/.
Tutte le views sono protette da autenticazione JWT salvo eccezioni esplicite.
"""
import os
import json
import logging

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Item, CVData
from .serializers import ItemSerializer, CVDataSerializer
from .services.cv_service import parse_cv_from_file, validate_cv_file

logger = logging.getLogger(__name__)


# ==============================================================================
# ITEM VIEWS (legacy)
# ==============================================================================

class ItemListCreate(generics.ListCreateAPIView):
    """Lista e creazione Item — richiede autenticazione."""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]


# ==============================================================================
# JSON DATA VIEW (pubblica — solo lettura)
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_json_data(request):
    """Serve il file data.json come API pubblica (dati statici)."""
    file_path = os.path.join(os.path.dirname(__file__), "data", "data.json")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File non trovato"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "File JSON non valido"}, status=500)


# ==============================================================================
# CV PARSING VIEW
# ==============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])   # Permette upload anonimo; proteggi in produzione
@parser_classes([MultiPartParser, FormParser])
def parse_cv_upload_view(request):
    """
    Upload e parsing di un file CV.
    POST /api/parse-cv-upload/
    Body: multipart/form-data con campo 'cv_file'
    """
    if 'cv_file' not in request.FILES:
        return Response({"error": "Nessun file CV caricato. Usa il campo 'cv_file'."}, status=400)

    cv_file = request.FILES['cv_file']

    # Validazione preventiva
    validation_error = validate_cv_file(cv_file)
    if validation_error:
        return Response({"error": validation_error}, status=400)

    # Parsing tramite service
    result = parse_cv_from_file(cv_file)

    if "error" in result:
        logger.warning(f"Parsing CV fallito: {result['error']}")
        return Response(result, status=422)

    # Salva il risultato nel DB se l'utente è autenticato
    if request.user.is_authenticated:
        try:
            CVData.objects.create(
                user=request.user,
                raw_json=result,
                original_filename=cv_file.name,
            )
        except Exception as e:
            logger.warning(f"Impossibile salvare CVData per utente {request.user}: {e}")

    return Response(result, status=200)


# ==============================================================================
# RESUME MATCHER VIEW
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def match_resume(request):
    """
    Confronto CV vs Job Description.
    Richiede autenticazione JWT.
    """
    from .resume_matcher_service import process_resume, process_job_description, calculate_similarity

    resume_file = request.data.get("resume_file", "Data/Processed/Resumes/sample_resume.json")
    job_desc_file = request.data.get("job_desc_file", "Data/Processed/JobDescription/sample_jd.json")

    try:
        resume_data = process_resume(resume_file)
        job_desc_data = process_job_description(job_desc_file)
        similarity_score = calculate_similarity(
            resume_data["extracted_keywords"],
            job_desc_data["extracted_keywords"]
        )
        return Response({
            "resume_data": resume_data,
            "job_desc_data": job_desc_data,
            "similarity_score": similarity_score,
        })
    except Exception as e:
        logger.error(f"Errore resume match: {e}")
        return Response({"error": str(e)}, status=500)


# ==============================================================================
# CV DATA VIEWS (utente autenticato)
# ==============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_cv_list(request):
    """Lista i CV dell'utente autenticato."""
    cv_list = CVData.objects.filter(user=request.user)
    serializer = CVDataSerializer(cv_list, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cv(request, cv_id):
    """Elimina un CV dell'utente autenticato."""
    try:
        cv = CVData.objects.get(id=cv_id, user=request.user)
        cv.delete()
        return Response({"message": "CV eliminato."}, status=204)
    except CVData.DoesNotExist:
        return Response({"error": "CV non trovato."}, status=404)


# ==============================================================================
# STRIPE PAYMENTS
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout_view(request):
    """Crea una sessione Stripe Checkout per un piano specifico."""
    from .services.stripe_service import create_checkout_session
    
    price_id = request.data.get("price_id")
    if not price_id:
        return Response({"error": "Price ID mancante"}, status=400)
    
    # URL di ritorno (sostituisci con quelli reali in produzione)
    success_url = request.build_absolute_uri('/') + "?payment=success"
    cancel_url = request.build_absolute_uri('/') + "?payment=cancel"
    
    # Passiamo user_id e cv_id (se presente) nei metadati per il webhook
    cv_id = request.data.get("cv_id")
    metadata = {
        "user_id": request.user.id,
        "cv_id": cv_id,
        "plan_type": request.data.get("plan_type", "premium")
    }
    
    result = create_checkout_session(
        price_id=price_id,
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=request.user.email,
        metadata=metadata
    )
    
    if "error" in result:
        return Response(result, status=500)
    
    return Response(result)


@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook_view(request):
    """Gestisce i webhook di Stripe per aggiornare lo stato dell'utente."""
    from .services.stripe_service import verify_webhook_signature
    from .models import Payment, UserProfile, CVData
    
    payload = request.body
    sig_header = request.headers.get('STRIPE_SIGNATURE')
    
    result = verify_webhook_signature(payload, sig_header)
    if "error" in result:
        return Response({"error": result["error"]}, status=400)
    
    event = result['event']
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        cv_id = metadata.get('cv_id')
        
        try:
            user = UserProfile.objects.filter(id=user_id).first()
            if not user:
                customer_email = session.get('customer_email')
                user = UserProfile.objects.filter(email=customer_email).first()

            amount_total = session.get('amount_total', 0) / 100
            stripe_id = session.get('id')

            Payment.objects.create(
                user=user,
                stripe_charge_id=stripe_id,
                amount=amount_total,
                status="completed"
            )

            if user:
                # Esempio: aggiorna il piano in base al price_id o metadati
                plan_type = metadata.get('plan_type', 'premium')
                user.plan = plan_type
                user.save()
                
                # Se c'è un CV associato, pubblicalo
                if cv_id:
                    cv = CVData.objects.filter(id=cv_id, user=user).first()
                    if cv:
                        cv.is_published = True
                        cv.save()
                
                logger.info(f"Pagamento {plan_type} completato per {user.email}")
                
        except Exception as e:
            logger.error(f"Errore nel webhook Stripe: {e}")

    return Response({"status": "success"})


# ==============================================================================
# DASHBOARD & PERSISTENCE FASE 4
# ==============================================================================

class CVDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Ritorna la lista dei CV dell'utente con statistiche."""
        cvs = CVData.objects.filter(user=request.user)
        data = []
        for cv in cvs:
            data.append({
                "id": cv.id,
                "slug": cv.slug,
                "created_at": cv.created_at,
                "updated_at": cv.updated_at,
                "visits_count": cv.visits_count,
                "is_published": cv.is_published,
                "template_slug": cv.template_slug,
                "thumbnail": f"https://placehold.co/300x200?text={cv.slug}"
            })
        
        user_stats = {
            "total_cvs": cvs.count(),
            "total_visits": sum(cv.visits_count for cv in cvs),
            "plan": request.user.plan,
        }
        
        return Response({"cvs": data, "stats": user_stats}, status=status.HTTP_200_OK)

class CVPublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        """Visualizza un CV tramite slug e incrementa le visite."""
        try:
            cv = CVData.objects.get(slug=slug, is_published=True)
            cv.visits_count += 1
            cv.save(update_fields=['visits_count'])
            return Response(cv.raw_json, status=status.HTTP_200_OK)
        except CVData.DoesNotExist:
            return Response({"error": "CV non trovato o non pubblicato."}, status=404)

class CVUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cv_id):
        """Modifica i dati di un CV esistente."""
        try:
            cv = CVData.objects.get(id=cv_id, user=request.user)
            new_data = request.data.get('cv_data')
            if new_data:
                cv.raw_json = new_data
                cv.save()
                return Response({"message": "CV aggiornato con successo."})
            return Response({"error": "Dati mancanti."}, status=400)
        except CVData.DoesNotExist:
            return Response({"error": "CV non trovato."}, status=404)