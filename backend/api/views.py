"""
API Views — refactored
La logica di business è stata spostata in api/services/.
Tutte le views sono protette da autenticazione JWT salvo eccezioni esplicite.
"""
import os
import json
import logging
from collections import Counter
from datetime import timedelta
from typing import Any
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
from .request_identity import get_cv_owner_profile
from .services.cv_service import parse_cv_from_file, validate_cv_file
from .services.cv_category_content import default_show_pricing
from .services.cv_public_access import resolve_public_cv
from .services.job_adapters import JobSearchService
from .services.job_matching import JobMatcher

logger = logging.getLogger(__name__)


def _as_float(value: Any) -> float | None:
    try:
        v = float(value)
        if v >= 0:
            return v
    except (TypeError, ValueError):
        return None
    return None


def _percentile(values: list[float], p: float) -> float | None:
    if not values:
        return None
    data = sorted(values)
    if len(data) == 1:
        return data[0]
    idx = (len(data) - 1) * p
    lo = int(idx)
    hi = min(lo + 1, len(data) - 1)
    frac = idx - lo
    return data[lo] * (1 - frac) + data[hi] * frac


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
@permission_classes([IsAuthenticated])  # Requires authentication + entitlement check
@parser_classes([MultiPartParser, FormParser])
def parse_cv_upload_view(request):
    """
    Upload e parsing di un file CV.
    POST /api/parse-cv-upload/
    Body: multipart/form-data con campo 'cv_file'
    """
    # Upload + parsing: consentito a ogni utente autenticato (il paywall resta su pubblicazione / piani).
    if 'cv_file' not in request.FILES:
        return Response({"error": "Nessun file CV caricato. Usa il campo 'cv_file'."}, status=400)

    cv_file = request.FILES['cv_file']

    # Categoria professionale e posizioni target: guidano quali sezioni del
    # template (Expertise/Servizi/Tariffe/Statistiche) vengono generate.
    category = (request.data.get('category') or '').strip()
    valid_categories = {c[0] for c in CVData.CATEGORY_CHOICES}
    if category not in valid_categories:
        category = ''
    target_positions = (request.data.get('target_positions') or '').strip()
    show_pricing_raw = request.data.get('show_pricing')
    if show_pricing_raw is None:
        show_pricing = default_show_pricing(category or None)
    else:
        show_pricing = str(show_pricing_raw).lower() in ('true', '1', 'yes', 'on')

    # Validazione preventiva
    validation_error = validate_cv_file(cv_file)
    if validation_error:
        return Response({"error": validation_error}, status=400)

    # Parsing tramite service
    result = parse_cv_from_file(cv_file, category=category or None, target_positions=target_positions or None)

    if "error" in result:
        logger.warning(f"Parsing CV fallito: {result['error']}")
        return Response(result, status=422)

    # Salva il risultato nel DB
    try:
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"error": "Profilo utente non disponibile."}, status=401)
        cv = CVData.objects.create(
            user=profile,
            raw_json=result,
            original_filename=cv_file.name,
            structured_profile=result.get('structured', {}),
            category=category,
            target_positions=target_positions,
            show_pricing=show_pricing,
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_cv_draft_view(request):
    """
    Crea un CV vuoto (bozza) per compilazione manuale nel wizard, senza upload file.
    POST /api/v1/cv/draft/
    """
    profile = get_cv_owner_profile(request)
    if not profile:
        return Response({"error": "Profilo utente non disponibile."}, status=401)
    try:
        cv = CVData.objects.create(
            user=profile,
            raw_json={},
            original_filename='',
            structured_profile={},
        )
        CVLinkPolicy.objects.create(
            cv=cv,
            visibility='public_with_expiry',
            expires_at=timezone.now() + timedelta(days=365),
        )
        return Response(CVDataSerializer(cv).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.warning('Impossibile creare bozza CV: %s', e)
        return Response({"error": "Impossibile creare il CV."}, status=500)


# ==============================================================================
# ENTITLEMENT VIEWS
# ==============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_entitlement(request, feature):
    """Check if user has entitlement for a specific feature."""
    profile = get_cv_owner_profile(request)
    if not profile:
        return Response({"error": "Profilo utente non disponibile."}, status=401)
    entitlement = Entitlement.objects.filter(
        user=profile,
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
    profile = get_cv_owner_profile(request)
    if not profile:
        return Response([])
    entitlements = Entitlement.objects.filter(
        user=profile,
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

    return Response(data)


# ==============================================================================
# CV LINK POLICY VIEWS
# ==============================================================================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def cv_link_policy(request, cv_id):
    """Get or update CV link policy."""
    try:
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"error": "Profilo utente non disponibile."}, status=401)
        cv = CVData.objects.get(id=cv_id, user=profile)
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

            # Il frontend pubblico (`/u/:slug`) richiede `is_published` su CVData.
            cv.is_published = True
            cv.save(update_fields=['is_published', 'updated_at'])

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
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"error": "Profilo utente non disponibile."}, status=401)
        cv = CVData.objects.get(id=cv_id, user=profile)
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
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"error": "Profilo utente non disponibile."}, status=401)
        cv = CVData.objects.get(id=cv_id, user=profile)
        policy = cv.link_policy
        policy.revoke()

        cv.is_published = False
        cv.save(update_fields=['is_published', 'updated_at'])

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
    profile = get_cv_owner_profile(request)
    if not profile:
        return Response({"error": "Profilo utente non disponibile."}, status=401)
    # Get or create job profile
    job_profile, _ = JobProfile.objects.get_or_create(
        user=profile,
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
    profile = get_cv_owner_profile(request)
    if not profile:
        return Response({"error": "Profilo utente non disponibile."}, status=401)
    # Get user's job profile
    job_profile, _ = JobProfile.objects.get_or_create(
        user=profile,
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
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"error": "Profilo utente non disponibile."}, status=401)
        match = JobMatch.objects.get(
            id=match_id,
            job_profile__user=profile
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
    profile = get_cv_owner_profile(request)
    cv_list = CVData.objects.filter(user=profile) if profile else CVData.objects.none()
    serializer = CVDataSerializer(cv_list, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cv(request, cv_id):
    """Elimina un CV dell'utente autenticato."""
    try:
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"error": "Profilo utente non disponibile."}, status=401)
        cv = CVData.objects.get(id=cv_id, user=profile)
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

    # URL di ritorno — punta alle route del frontend (lang preferibilmente dal body per coerenza con la UI)
    from django.conf import settings as django_settings
    _frontend = getattr(django_settings, 'FRONTEND_URL', request.build_absolute_uri('/').rstrip('/'))
    _lang = (request.data.get('lang') or '').strip().lower()[:2] or None
    if _lang not in ('it', 'en'):
        _lang = (request.headers.get('Accept-Language', 'it') or 'it').split(',')[0].split('-')[0][:2]
    if _lang not in ('it', 'en'):
        _lang = 'it'
    success_url = f"{_frontend}/{_lang}/payment/success"
    cancel_url = f"{_frontend}/{_lang}/pricing"

    profile = get_cv_owner_profile(request)
    if not profile:
        return Response({"error": "Profilo utente non trovato."}, status=400)

    # Passiamo user_id (UserProfile.id) e cv_id nei metadati per il webhook Stripe
    cv_id = request.data.get("cv_id")
    checkout_mode = request.data.get("checkout_mode", "payment")
    if checkout_mode not in ("payment", "subscription"):
        checkout_mode = "payment"

    metadata = {
        "user_id": str(profile.id),
        "plan_type": str(request.data.get("plan_type", "premium")),
        "feature": str(request.data.get("feature", "cv_publish")),
        "checkout_mode": checkout_mode,
    }
    if cv_id is not None and str(cv_id).strip() != "":
        metadata["cv_id"] = str(cv_id)

    result = create_checkout_session(
        price_id=price_id,
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=profile.email,
        metadata=metadata,
        checkout_mode=checkout_mode,
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

            amount_total = (session.get('amount_total') or 0) / 100
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
                checkout_mode = metadata.get('checkout_mode', 'payment')
                subscription_id = session.get('subscription')
                if checkout_mode == 'subscription':
                    expires_at = None
                    ent_metadata = {
                        'stripe_session_id': stripe_id,
                        'stripe_subscription_id': subscription_id,
                        'checkout_mode': 'subscription',
                    }
                else:
                    expiry_months = int(metadata.get('expiry_months', 12))
                    expires_at = timezone.now() + timedelta(days=30 * expiry_months)
                    ent_metadata = {'stripe_session_id': stripe_id, 'checkout_mode': 'payment'}

                ent, created = Entitlement.objects.update_or_create(
                    user=user,
                    feature=feature,
                    is_active=True,
                    defaults={
                        'expires_at': expires_at,
                        'metadata': ent_metadata,
                    },
                )

                # Update plan
                plan_type = metadata.get('plan_type', 'premium')
                user.plan = plan_type
                user.save()

                logger.info(
                    "Entitlement %s %s for %s",
                    feature,
                    "created" if created else "updated",
                    user.email,
                )

                # Pubblica il CV collegato al checkout (metadata `cv_id`), se presente.
                if feature == 'cv_publish' and metadata.get('cv_id'):
                    try:
                        cv_pk = int(metadata['cv_id'])
                        cv_pub = CVData.objects.filter(id=cv_pk, user=user).first()
                        if cv_pub:
                            cv_pub.is_published = True
                            cv_pub.save(update_fields=['is_published', 'updated_at'])
                            logger.info("CV id=%s impostato is_published da webhook Stripe.", cv_pk)
                    except (TypeError, ValueError) as e:
                        logger.warning("cv_id metadata non valido nel webhook Stripe: %s", e)

        except Exception as e:
            logger.error(f"Errore nel webhook Stripe: {e}")

    elif event['type'] in ('customer.subscription.updated', 'customer.subscription.deleted'):
        try:
            from .services.stripe_subscription_sync import sync_entitlement_from_subscription

            sync_entitlement_from_subscription(event['data']['object'])
        except Exception as e:
            logger.error('Errore sync subscription Stripe: %s', e, exc_info=True)

    return Response({"status": "success"})


# ==============================================================================
# DASHBOARD & PERSISTENCE FASE 4
# ==============================================================================

class CVDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Ritorna la lista dei CV dell'utente con statistiche."""
        profile = get_cv_owner_profile(request)
        if not profile:
            return Response({"cvs": [], "stats": {"total_cvs": 0, "total_visits": 0, "plan": "free"}}, status=status.HTTP_200_OK)
        # Performance: select_related evita una query separata per ogni CV per
        # leggere link_policy (era N+1: 1 query per la lista + 1 per ogni CV per
        # cv.link_policy). only() esclude raw_json/structured_profile (blob JSON
        # potenzialmente grandi, mai usati in questa risposta) dal SELECT: meno
        # dati da trasferire/deserializzare per ogni riga. Stessa identica
        # risposta di prima, solo più query-efficiente.
        cvs = (
            CVData.objects.filter(user=profile)
            .select_related('link_policy')
            .only(
                'id', 'slug', 'created_at', 'updated_at',
                'visits_count', 'is_published', 'template_slug',
                'link_policy__visibility', 'link_policy__expires_at', 'link_policy__is_revoked',
            )
        )
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
            "plan": profile.plan,
        }

        return Response({"cvs": data, "stats": user_stats}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cv_extraction_kpi_view(request):
    """
    Report KPI estrazione CV basato su `raw_json.nordevit_extraction`.
    - scope=mine (default): CV dell'utente
    - scope=all: solo staff/admin
    """
    profile = get_cv_owner_profile(request)
    if not profile:
        return Response({"error": "Profilo utente non disponibile."}, status=401)

    scope = (request.query_params.get("scope") or "mine").strip().lower()
    since_days = request.query_params.get("since_days")
    is_staff = bool(getattr(request.user, "is_staff", False) or getattr(profile, "is_staff", False))

    if scope == "all":
        if not is_staff:
            return Response({"error": "Solo admin/staff possono usare scope=all."}, status=403)
        qs = CVData.objects.all()
    else:
        scope = "mine"
        qs = CVData.objects.filter(user=profile)

    if since_days:
        try:
            days = int(since_days)
            if days > 0:
                cutoff = timezone.now() - timedelta(days=days)
                qs = qs.filter(updated_at__gte=cutoff)
        except ValueError:
            return Response({"error": "Parametro since_days non valido."}, status=400)

    total_cvs = qs.count()
    stage_totals: list[float] = []
    quality_initial: list[float] = []
    quality_final: list[float] = []
    path_counter: Counter[str] = Counter()
    llm_calls = {"openai_text": 0, "openai_vision": 0, "gemini_pdf": 0}
    coverage_checks = Counter()
    with_meta = 0
    with_quality = 0

    for cv in qs.only("raw_json"):
        raw = cv.raw_json if isinstance(cv.raw_json, dict) else {}
        meta = raw.get("nordevit_extraction") if isinstance(raw, dict) else None
        if not isinstance(meta, dict):
            continue
        with_meta += 1

        stage = meta.get("stage_ms")
        if isinstance(stage, dict):
            t = _as_float(stage.get("total"))
            if t is not None:
                stage_totals.append(t)

        path_taken = meta.get("path_taken")
        if isinstance(path_taken, list) and path_taken:
            path_counter["->".join(str(x) for x in path_taken)] += 1
        else:
            path_counter["unknown"] += 1

        lc = meta.get("llm_calls")
        if isinstance(lc, dict):
            for key in llm_calls:
                llm_calls[key] += int(lc.get(key) or 0)

        q = meta.get("quality")
        if isinstance(q, dict):
            with_quality += 1
            qi = _as_float((q.get("initial") or {}).get("score") if isinstance(q.get("initial"), dict) else None)
            qf = _as_float((q.get("final") or {}).get("score") if isinstance(q.get("final"), dict) else None)
            if qi is not None:
                quality_initial.append(qi)
            if qf is not None:
                quality_final.append(qf)
            final_checks = (q.get("final") or {}).get("checks") if isinstance(q.get("final"), dict) else None
            if isinstance(final_checks, dict):
                for key, ok in final_checks.items():
                    if bool(ok):
                        coverage_checks[key] += 1

    latency_summary = {
        "count": len(stage_totals),
        "avg": round(sum(stage_totals) / len(stage_totals), 2) if stage_totals else None,
        "p50": round(_percentile(stage_totals, 0.5), 2) if stage_totals else None,
        "p90": round(_percentile(stage_totals, 0.9), 2) if stage_totals else None,
    }
    quality_summary = {
        "count": len(quality_final),
        "avg_initial": round(sum(quality_initial) / len(quality_initial), 3) if quality_initial else None,
        "avg_final": round(sum(quality_final) / len(quality_final), 3) if quality_final else None,
        "p50_final": round(_percentile(quality_final, 0.5), 3) if quality_final else None,
    }
    denominator = with_quality if with_quality > 0 else 1
    coverage_rates = {k: round(v / denominator, 3) for k, v in coverage_checks.items()}

    return Response(
        {
            "scope": scope,
            "total_cvs": total_cvs,
            "with_extraction_meta": with_meta,
            "with_quality": with_quality,
            "latency_ms": latency_summary,
            "quality": quality_summary,
            "path_distribution": dict(path_counter),
            "llm_calls": llm_calls,
            "coverage_rates": coverage_rates,
        },
        status=status.HTTP_200_OK,
    )


class CVPublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        """Visualizza un CV tramite slug e incrementa le visite."""
        token = request.query_params.get("token")
        cv, err_status, err_code = resolve_public_cv(slug, token)
        if err_status:
            messages = {
                "not_found": "CV non trovato.",
                "not_published": "Questo CV non è ancora pubblicato o non è accessibile senza un piano attivo.",
                "forbidden": "CV non accessibile o link scaduto.",
            }
            msg = messages.get(err_code or "", "CV non disponibile.")
            return Response({"error": msg, "code": err_code}, status=err_status)

        cv.visits_count += 1
        cv.save(update_fields=["visits_count"])

        payload = dict(cv.raw_json) if isinstance(cv.raw_json, dict) else {}
        # Metadati di template (categoria, template scelto, visibilita' Tariffe)
        # usati dal frontend per scegliere il template giusto e le sezioni da
        # mostrare sulla pagina pubblica.
        payload["_category"] = cv.category
        payload["_show_pricing"] = cv.show_pricing
        payload["_template_slug"] = cv.template_slug
        return Response(payload, status=status.HTTP_200_OK)


class CVDetailView(APIView):
    """Dettaglio CV (incluso raw_json) per il proprietario autenticato."""

    permission_classes = [IsAuthenticated]

    def get(self, request, cv_id):
        try:
            profile = get_cv_owner_profile(request)
            if not profile:
                return Response({"error": "Profilo utente non disponibile."}, status=401)
            cv = CVData.objects.get(id=cv_id, user=profile)
            return Response(CVDataSerializer(cv).data)
        except CVData.DoesNotExist:
            return Response({"error": "CV non trovato."}, status=404)


class CVUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cv_id):
        """Modifica i dati di un CV esistente."""
        try:
            profile = get_cv_owner_profile(request)
            if not profile:
                return Response({"error": "Profilo utente non disponibile."}, status=401)
            cv = CVData.objects.get(id=cv_id, user=profile)
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

    user = get_cv_owner_profile(request)
    if not user:
        return Response({"error": "Profilo utente non disponibile."}, status=401)

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
        user = UserProfile.objects.get(email_verification_token=UserProfile.hash_verification_token(token))
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
    user = get_cv_owner_profile(request)
    if not user:
        return Response({"error": "Profilo utente non disponibile."}, status=401)
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
