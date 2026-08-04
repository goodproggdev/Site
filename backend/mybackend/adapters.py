"""
Adapter django-allauth personalizzato.

In produzione (DEBUG=False) EMAIL_BACKEND e' quello SMTP, ma finche' non
vengono configurate credenziali SMTP reali (EMAIL_HOST_USER/EMAIL_HOST_PASSWORD
sono vuote di default) qualsiasi invio email fallisce con un'eccezione non
gestita. Con ACCOUNT_EMAIL_VERIFICATION='mandatory', la registrazione invia
sempre un'email di conferma subito dopo aver creato l'utente: l'eccezione
di invio propagava fino alla view e la registrazione rispondeva HTTP 500,
anche se i dati inseriti dall'utente erano validi e l'account veniva
comunque creato nel database (inconsistente: account creato ma frontend
mostrava errore).

Questo adapter intercetta i fallimenti di invio email (di conferma
registrazione, reset password, ecc.) e li registra nei log invece di far
fallire la richiesta: l'utente puo' registrarsi/reimpostare la password
anche prima che l'invio email reale sia configurato correttamente.
"""
import logging

from allauth.account.adapter import DefaultAccountAdapter

logger = logging.getLogger(__name__)


class ResilientAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        try:
            super().send_mail(template_prefix, email, context)
        except Exception:
            logger.exception(
                "Invio email fallito (template=%s, destinatario=%s). "
                "La richiesta e' comunque andata a buon fine: controlla "
                "EMAIL_HOST_USER/EMAIL_HOST_PASSWORD se l'email doveva partire.",
                template_prefix,
                email,
            )
