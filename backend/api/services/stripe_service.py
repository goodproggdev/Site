"""Servizio per la gestione dei pagamenti Stripe."""
import stripe
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


from typing import Optional, Dict

def create_checkout_session(price_id: str, success_url: str, cancel_url: str, customer_email: Optional[str] = None, metadata: Optional[Dict] = None) -> dict:
    """Crea una sessione Stripe Checkout con metadati per il tracking."""
    try:
        session_params = {
            'payment_method_types': ['card'],
            'line_items': [{'price': price_id, 'quantity': 1}],
            'mode': 'payment',
            'success_url': success_url,
            'cancel_url': cancel_url,
        }
        if customer_email:
            session_params['customer_email'] = customer_email
        
        if metadata:
            session_params['metadata'] = metadata

        session = stripe.checkout.Session.create(**session_params)
        return {'session_id': session.id, 'url': session.url}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        return {'error': str(e)}


def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
    """Verifica la firma webhook Stripe."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        return {'event': event}
    except (stripe.error.SignatureVerificationError, ValueError) as e:
        logger.warning(f"Webhook signature invalid: {e}")
        return {'error': str(e)}
