"""Sincronizza entitlement locali con il ciclo di vita delle Subscription Stripe."""
import logging
from datetime import datetime, timezone as dt_timezone
from typing import Any, Dict

from django.utils import timezone

from api.models import Entitlement, UserProfile

logger = logging.getLogger(__name__)

# Stati in cui l’utente ha ancora diritto all’accesso legato all’abbonamento (Stripe può mettere past_due in retry).
_ACCESS_STATUSES = frozenset({'active', 'trialing', 'past_due'})

# Stati terminali o senza accesso: revoca (o non rinnova) il beneficio legato alla subscription.
_NO_ACCESS_STATUSES = frozenset({
    'canceled',
    'unpaid',
    'incomplete_expired',
    'paused',
})


def _period_end_aware(subscription: Dict[str, Any]):
    ts = subscription.get('current_period_end')
    if ts is None:
        return None
    try:
        return datetime.fromtimestamp(int(ts), tz=dt_timezone.utc)
    except (TypeError, ValueError, OSError):
        return None


def _allowed_feature(feature: str) -> str:
    allowed = {c[0] for c in Entitlement.FEATURE_CHOICES}
    return feature if feature in allowed else 'cv_publish'


def _entitlements_for_subscription(user: UserProfile, feature: str, sub_id: str):
    """Righe entitlement subscription per questo utente/feature (evita di toccare i pagamenti una tantum)."""
    qs = Entitlement.objects.filter(user=user, feature=feature, is_active=True)
    by_sub = qs.filter(metadata__stripe_subscription_id=sub_id)
    if by_sub.exists():
        return by_sub
    return qs.filter(metadata__checkout_mode='subscription')


def sync_entitlement_from_subscription(subscription: Dict[str, Any]) -> None:
    """
    Chiamato da webhook Stripe: customer.subscription.updated | customer.subscription.deleted.

    Aggiorna scadenza (current_period_end) su rinnovi e disattiva su cancellazione / stati terminali.
    """
    metadata = subscription.get('metadata') or {}
    user_id = metadata.get('user_id')
    if not user_id:
        logger.warning('Subscription %s: metadata senza user_id', subscription.get('id'))
        return

    try:
        uid = int(user_id)
    except (TypeError, ValueError):
        logger.warning('Subscription %s: user_id non numerico: %r', subscription.get('id'), user_id)
        return

    user = UserProfile.objects.filter(id=uid).first()
    if not user:
        logger.warning('Subscription %s: UserProfile id=%s assente', subscription.get('id'), uid)
        return

    feature = _allowed_feature(str(metadata.get('feature') or 'cv_publish'))
    sub_id = subscription.get('id') or ''
    status = (subscription.get('status') or '').lower()
    period_end = _period_end_aware(subscription)

    if status in _ACCESS_STATUSES:
        existing = Entitlement.objects.filter(user=user, feature=feature, is_active=True).first()
        merged_meta: Dict[str, Any] = dict(existing.metadata) if existing and existing.metadata else {}
        merged_meta.update({
            'stripe_subscription_id': sub_id,
            'checkout_mode': 'subscription',
            'subscription_status': status,
        })
        Entitlement.objects.update_or_create(
            user=user,
            feature=feature,
            is_active=True,
            defaults={
                'expires_at': period_end,
                'metadata': merged_meta,
            },
        )
        allowed_plans = {c[0] for c in UserProfile.PLAN_CHOICES}
        plan_type = str(metadata.get('plan_type') or 'pro')
        if plan_type not in allowed_plans:
            plan_type = 'pro'
        if user.plan != plan_type:
            user.plan = plan_type
            user.save(update_fields=['plan'])
        logger.info(
            'Subscription %s sincronizzata: user=%s status=%s period_end=%s',
            sub_id,
            user.email,
            status,
            period_end,
        )
        return

    if status in _NO_ACCESS_STATUSES or not status:
        for ent in _entitlements_for_subscription(user, feature, sub_id):
            meta = dict(ent.metadata or {})
            meta['subscription_status'] = status or 'deleted'
            meta['deactivated_at'] = timezone.now().isoformat()
            ent.is_active = False
            ent.expires_at = timezone.now()
            ent.metadata = meta
            ent.save(update_fields=['is_active', 'expires_at', 'metadata'])
        if user.plan != 'free':
            user.plan = 'free'
            user.save(update_fields=['plan'])
        logger.info('Subscription %s revocata: user=%s status=%s', sub_id, user.email, status or 'deleted')
        return

    # incomplete: in attesa del primo pagamento — non sovrascrivere checkout.session.completed
    if status == 'incomplete':
        logger.debug('Subscription %s incomplete, skip sync', sub_id)
        return

    logger.info('Subscription %s: stato non gestito esplicitamente (%s), nessuna modifica', sub_id, status)
