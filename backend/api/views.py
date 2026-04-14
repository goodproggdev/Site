"""
API Views — refactored
La logica di business è stata spostata in api/services/.
Tutte le views sono protette da autenticazione JWT salvo eccezioni esplicite.
"""
import os
import json
import logging
from datetime import timedelta
from django.utils import timezone

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    Item, CVData, Entitlement, CVLinkPolicy, JobProfile, JobMatch, UserProfile
)
from .serializers import ItemSerializer, CVDataSerializer
from .services.cv_service import parse_cv_from_file, validate_cv_file
from .services.job_adapters import JobSearchService
from .services.job_matching import JobMatcher

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
# API ROOT VIEW
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def api_v1_root(request):
    """Root view for API v1 — fornisce informazioni di base sugli endpoint."""
    return Response({
        "status": "active",
        "version": "1.0.0",
        "message": "Benvenuto nella Nordevit CV Platform API v1",
        "endpoints": {
            "authentication": "/auth/token/",
            "cv_management": "/api/v1/cv/",
            "cv_parsing": "/api/v1/parse-cv-upload/",
            "job_matching": "/api/v1/jobs/matches/",
            "payments": "/api/v1/stripe/create-checkout/",
            "dashboard": "/api/v1/dashboard/",
        }
    }, status=200)


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
@permission_classes([IsAuthenticated])  # Requires authentication + entitlement check
@parser_classes([MultiPartParser, FormParser])
def parse_cv_upload_view(request):
    """
    Upload e parsing di un file CV.
    POST /api/parse-cv-upload/
    Body: multipart/form-data con campo 'cv_file'
    """
    # Check entitlement
    has_entitlement = Entitlement.objects.filter(
        user=request.user,
        feature='cv_publish',
        is_active=True
    ).exists()

    if not has_entitlement:
        return Response(
            {"error": "Feature non disponibile. Effettua il pagamento per pubblicare un CV."},
            status=403
        )

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

    # Salva il risultato nel DB
    try:
        cv = CVData.objects.create(
            user=request.user,
            raw_json=result,
            original_filename=cv_file.name,
            structured_profile=result.get('structured', {}),
        )

        # Create default link policy
        CVLinkPolicy.objects.create(
            cv=cv,
            visibility='public_with_expiry',
            expires_at=timezone.now() + timedelta(days=365),
        )

        return Response({
            "cv_id": cv.id,
            "slug": cv.slug,
            "parsed_data": result,
        }, status=200)

    except Exception as e:
        logger.warning(f"Impossibile salvare CVData: {e}")
        return Response({"error": "Errore nel salvataggio del CV"}, status=500)


# ==============================================================================
# ENTITLEMENT VIEWS
# ==============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_entitlement(request, feature):
    """Check if user has entitlement for a specific feature."""
    entitlement = Entitlement.objects.filter(
        user=request.user,
        feature=feature,
        is_active=True
    ).first()

    if entitlement and entitlement.is_valid():
        return Response({
            "has_entitlement": True,
            "feature": feature,
            "expires_at": entitlement.expires_at,
        })

    return Response({
        "has_entitlement": False,
        "feature": feature,
    }, status=403)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_entitlements(request):
    """List all active entitlements for the user."""
    entitlements = Entitlement.objects.filter(
        user=request.user,
        is_active=True
    )

    data = []
    for e in entitlements:
        data.append({
            "feature": e.feature,
            "activated_at": e.activated_at,
            "expires_at": e.expires_at,
            "is_valid": e.is_valid(),
        })

    return Response({"entitlements": data})


# ==============================================================================
# CV LINK POLICY VIEWS
# ==============================================================================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def cv_link_policy(request, cv_id):
    """Get or update CV link policy."""
    try:
        cv = CVData.objects.get(id=cv_id, user=request.user)
        policy, _ = CVLinkPolicy.objects.get_or_create(
            cv=cv,
            defaults={
                'visibility': 'public_with_expiry',
                'expires_at': timezone.now() + timedelta(days=365),
            }
        )

        if request.method == 'GET':
            return Response({
                "cv_id": cv_id,
                "slug": cv.slug,
                "visibility": policy.visibility,
                "expires_at": policy.expires_at,
                "is_revoked": policy.is_revoked,
                "access_token": policy.access_token if policy.visibility == 'private_tokenized' else None,
                "public_url": policy.get_public_url(request.build_absolute_uri('/')[:-1]),
            })

        if request.method == 'PUT':
            visibility = request.data.get('visibility')
            expiry_months = request.data.get('expiry_months', 12)

            if visibility in ['public_with_expiry', 'private_tokenized']:
                policy.visibility = visibility

                if visibility == 'public_with_expiry':
                    policy.expires_at = timezone.now() + timedelta(days=30 * expiry_months)
                elif visibility == 'private_tokenized':
                    if not policy.access_token:
                        policy.generate_token()
                    policy.expires_at = None  # Token-based doesn't expire

                policy.save()

            return Response({
                "message": "Policy aggiornata con successo",
                "visibility": policy.visibility,
                "public_url": policy.get_public_url(request.build_absolute_uri('/')[:-1]),
            })

    except CVData.DoesNotExist:
        return Response({"error": "CV non trovato"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_cv_token(request, cv_id):
    """Regenerate access token for private CV link."""
    try:
        cv = CVData.objects.get(id=cv_id, user=request.user)
        policy = cv.link_policy

        if policy.visibility != 'private_tokenized':
            return Response({"error": "CV non è in modalità privata"}, status=400)

        policy.generate_token()

        return Response({
            "message": "Token rigenerato",
            "access_token": policy.access_token,
        })

    except CVData.DoesNotExist:
        return Response({"error": "CV non trovato"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_cv_access(request, cv_id):
    """Revoke access to a CV link."""
    try:
        cv = CVData.objects.get(id=cv_id, user=request.user)
        policy = cv.link_policy
        policy.revoke()

        return Response({"message": "Accesso revocato con successo"})

    except CVData.DoesNotExist:
        return Response({"error": "CV non trovato"}, status=404)


# ==============================================================================
# JOB MATCHING VIEWS
# ==============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_matches(request):
    """Get job matches for the user's profile."""
    # Get or create job profile
    job_profile, _ = JobProfile.objects.get_or_create(
        user=request.user,
        defaults={'skills': [], 'locations': []}
    )

    # Get existing matches
    matches = JobMatch.objects.filter(
        job_profile=job_profile,
        status__in=['new', 'viewed', 'saved']
    ).order_by('-match_score')[:20]

    data = []
    for match in matches:
        data.append({
            "id": str(match.id),
            "title": match.title,
            "company": match.company,
            "location": match.location,
            "salary": match.salary,
            "description": match.description[:200] + "..." if len(match.description) > 200 else match.description,
            "url": match.url,
            "posted_at": match.posted_at,
            "match_score": int(match.match_score),
            "match_reasons": match.match_reasons,
            "status": match.status,
            "source": match.source,
        })

    return Response({"jobs": data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_job_matches(request):
    """Search for new job matches and update the database."""
    # Get user's job profile
    job_profile, _ = JobProfile.objects.get_or_create(
        user=request.user,
        defaults={'skills': [], 'locations': []}
    )

    # Build search query from profile
    query = {
        'title': job_profile.title or '',
        'location': job_profile.locations[0] if job_profile.locations else '',
        'skills': job_profile.skills,
        'limit': 50,
    }

    # Search job boards
    service = JobSearchService()
    raw_jobs = service.search_all(query)

    # Match and score
    matcher = JobMatcher()
    profile_data = {
        'title': job_profile.title,
        'seniority': job_profile.seniority,
        'skills': job_profile.skills,
        'locations': job_profile.locations,
        'salary_min': job_profile.salary_min,
        'salary_max': job_profile.salary_max,
        'years_experience': job_profile.years_experience,
    }

    scored_jobs = matcher.rank_jobs(profile_data, raw_jobs, min_score=30)

    # Save to database
    created_count = 0
    for job_data in scored_jobs[:20]:  # Top 20 matches
        match, created = JobMatch.objects.update_or_create(
            job_profile=job_profile,
            external_id=job_data['external_id'],
            defaults={
                'source': job_data['source'],
                'title': job_data['title'],
                'company': job_data['company'],
                'location': job_data['location'],
                'salary': job_data['salary'],
                'description': job_data['description'],
                'url': job_data['url'],
                'posted_at': job_data.get('posted_at'),
                'match_score': job_data['match_score'],
                'match_reasons': job_data['match_reasons'],
                'status': 'new',
            }
        )
        if created:
            created_count += 1

    return Response({
        "message": f"Trovate {len(scored_jobs)} offerte, {created_count} nuove",
        "new_matches": created_count,
        "total_matches": len(scored_jobs),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_job_match_status(request, match_id):
    """Update status of a job match (viewed, saved, applied, dismissed)."""
    try:
        match = JobMatch.objects.get(
            id=match_id,
            job_profile__user=request.user
        )

        new_status = request.data.get('status')
        if new_status in ['viewed', 'saved', 'applied', 'dismissed']:
            match.status = new_status
            match.save()
            return Response({"message": "Stato aggiornato", "status": new_status})

        return Response({"error": "Stato non valido"}, status=400)

    except JobMatch.DoesNotExist:
        return Response({"error": "Offerta non trovata"}, status=404)


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

    # URL di ritorno — punta alle route del frontend
    from django.conf import settings as django_settings
    _frontend = getattr(django_settings, 'FRONTEND_URL', request.build_absolute_uri('/').rstrip('/'))
    _lang = (request.headers.get('Accept-Language', 'it') or 'it').split(',')[0].split('-')[0][:2]
    success_url = f"{_frontend}/{_lang}/payment/success"
    cancel_url = f"{_frontend}/{_lang}/pricing"

    # Passiamo user_id e cv_id (se presente) nei metadati per il webhook
    cv_id = request.data.get("cv_id")
    metadata = {
        "user_id": request.user.id,
        "cv_id": cv_id,
        "plan_type": request.data.get("plan_type", "premium"),
        "feature": request.data.get("feature", "cv_publish"),
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
    from .models import Payment

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
        feature = metadata.get('feature', 'cv_publish')

        # Idempotency: skip if this session was already processed
        from .models import Payment
        session_id_check = session.get('id')
        if session_id_check and Payment.objects.filter(stripe_session_id=session_id_check).exists():
            return JsonResponse({'status': 'already_processed'})

        try:
            user = UserProfile.objects.filter(id=user_id).first()
            if not user:
                customer_email = session.get('customer_email')
                user = UserProfile.objects.filter(email=customer_email).first()

            amount_total = session.get('amount_total', 0) / 100
            stripe_id = session.get('id')

            # Create payment record
            Payment.objects.create(
                user=user,
                stripe_payment_id=stripe_id,
                stripe_session_id=session.get('id'),
                amount=amount_total,
                currency=session.get('currency', 'eur').upper(),
                status='paid',
                description=session.get('description', f'Payment for {feature}'),
            )

            if user:
                # Create entitlement
                expiry_months = int(metadata.get('expiry_months', 12))
                Entitlement.objects.create(
                    user=user,
                    feature=feature,
                    is_active=True,
                    expires_at=timezone.now() + timedelta(days=30 * expiry_months),
                    metadata={'stripe_session_id': stripe_id},
                )

                # Update plan
                plan_type = metadata.get('plan_type', 'premium')
                user.plan = plan_type
                user.save()

                logger.info(f"Entitlement {feature} created for {user.email}")

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
            # Get link policy if exists
            policy = getattr(cv, 'link_policy', None)
            link_data = None
            if policy:
                link_data = {
                    "visibility": policy.visibility,
                    "is_accessible": policy.is_accessible(),
                    "expires_at": policy.expires_at,
                }

            data.append({
                "id": cv.id,
                "slug": cv.slug,
                "created_at": cv.created_at,
                "updated_at": cv.updated_at,
                "visits_count": cv.visits_count,
                "is_published": cv.is_published,
                "template_slug": cv.template_slug,
                "thumbnail": f"https://placehold.co/300x200?text={cv.slug}",
                "link_policy": link_data,
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
        # Check for token-based access
        token = request.query_params.get('token')

        try:
            cv = CVData.objects.get(slug=slug, is_published=True)

            # Check link policy
            policy = getattr(cv, 'link_policy', None)
            if policy:
                if not policy.is_accessible():
                    return Response({"error": "CV non accessibile o link scaduto."}, status=403)

                if policy.visibility == 'private_tokenized':
                    if not token or token != policy.access_token:
                        return Response({"error": "Token di accesso non valido."}, status=403)

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


# ==============================================================================
# EMAIL VERIFICATION VIEWS
# ==============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_email_view(request):
    """Send verification email to authenticated user."""
    from .services.email_service import send_verification_email
    from django.conf import settings

    user = request.user

    if user.is_email_verified:
        return Response({"error": "Email is already verified"}, status=400)

    success, result = user.resend_verification_email()

    if not success:
        return Response({"error": result}, status=429)

    # Send email
    frontend_url = settings.FRONTEND_URL
    try:
        send_verification_email(user, result, frontend_url)
        return Response({
            "message": "Verification email sent successfully",
            "email": user.email
        })
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
        return Response({"error": "Failed to send email. Please try again later."}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    """Verify email with token."""
    from .services.email_service import send_welcome_email

    token = request.data.get('token') or request.query_params.get('token')

    if not token:
        return Response({"error": "Verification token is required"}, status=400)

    try:
        user = UserProfile.objects.get(email_verification_token=token)
        success, message = user.verify_email(token)

        if success:
            # Send welcome email
            try:
                send_welcome_email(user)
            except Exception as e:
                logger.error(f"Failed to send welcome email: {e}")

            return Response({
                "message": message,
                "email": user.email,
                "verified": True
            })
        else:
            return Response({"error": message, "verified": False}, status=400)

    except UserProfile.DoesNotExist:
        return Response({"error": "Invalid verification token"}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_verification_status_view(request):
    """Get current user's email verification status."""
    user = request.user
    return Response({
        "email": user.email,
        "is_verified": user.is_email_verified,
        "verification_sent_at": user.email_verification_sent_at
    })


# ==============================================================================
# PASSWORD RESET VIEWS
# ==============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset_view(request):
    """Request password reset email."""
    from .services.email_service import send_password_reset_email
    from django.conf import settings
    import secrets

    email = request.data.get('email')

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = UserProfile.objects.get(email=email.lower().strip())

        # Generate reset token
        user.password_reset_token = secrets.token_urlsafe(32)
        user.password_reset_sent_at = timezone.now()
        user.save(update_fields=['password_reset_token', 'password_reset_sent_at'])

        # Send email
        frontend_url = settings.FRONTEND_URL
        try:
            send_password_reset_email(user, user.password_reset_token, frontend_url)
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            # Don't reveal if email was sent or not for security

    except UserProfile.DoesNotExist:
        pass  # Don't reveal if email exists or not

    # Always return success to prevent email enumeration
    return Response({
        "message": "If an account with that email exists, a password reset link has been sent."
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset_view(request):
    """Confirm password reset with token."""
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not token or not new_password:
        return Response({"error": "Token and new password are required"}, status=400)

    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters long"}, status=400)

    try:
        user = UserProfile.objects.get(password_reset_token=token)

        # Check token expiry (1 hour)
        if user.password_reset_sent_at:
            expiry = user.password_reset_sent_at + timedelta(hours=1)
            if timezone.now() > expiry:
                return Response({"error": "Password reset token has expired"}, status=400)

        # Set new password
        user.set_password(new_password)
        user.password_reset_token = ''
        user.password_reset_sent_at = None
        user.save(update_fields=['password', 'password_reset_token', 'password_reset_sent_at'])

        return Response({"message": "Password reset successfully. Please log in with your new password."})

    except UserProfile.DoesNotExist:
        return Response({"error": "Invalid or expired token"}, status=400)
