"""

Accesso in lettura ai CV pubblici (slug + policy + token).

Usato dalla API JSON e dalla vista HTML per crawler (meta senza JS).

"""

from __future__ import annotations



from typing import Optional, Tuple



from api.models import CVData



from .cv_entitlements import user_has_paid_cv_hosting_access



# Codici errore per JSON / frontend (i18n lato client)

PUBLIC_CV_CODE_NOT_FOUND = "not_found"

PUBLIC_CV_CODE_NOT_PUBLISHED = "not_published"

PUBLIC_CV_CODE_FORBIDDEN = "forbidden"





def resolve_public_cv(slug: str, token: Optional[str]) -> Tuple[Optional[CVData], Optional[int], Optional[str]]:

    """

    Restituisce (cv, None, None) se accesso consentito.

    Altrimenti (None, http_status, code) con code in:

      not_found, not_published, forbidden

    """

    try:

        # Performance: select_related("link_policy") evita una query separata
        # (getattr(cv, "link_policy", None) qui sotto) — questa funzione e' sul
        # percorso di ogni singola visualizzazione di una pagina CV pubblica
        # (API JSON, shell HTML SSR, immagine OG), quindi e' il punto a piu' alto
        # traffico dell'intera app.
        cv = CVData.objects.select_related("user", "link_policy").get(slug=slug)

    except CVData.DoesNotExist:

        return None, 404, PUBLIC_CV_CODE_NOT_FOUND



    if not cv.is_published and not user_has_paid_cv_hosting_access(cv.user):

        return None, 404, PUBLIC_CV_CODE_NOT_PUBLISHED



    policy = getattr(cv, "link_policy", None)

    if policy:

        if not policy.is_accessible():

            return None, 403, PUBLIC_CV_CODE_FORBIDDEN

        if policy.visibility == "private_tokenized":

            if not token or token != policy.access_token:

                return None, 403, PUBLIC_CV_CODE_FORBIDDEN



    return cv, None, None


