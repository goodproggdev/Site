from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self) -> None:
        # Allinea Site (django.contrib.sites) a SITE_DOMAIN / SITE_NAME così le email
        # di conferma non mostrano più "example.com" dopo il deploy.
        try:
            from django.conf import settings
            from django.contrib.sites.models import Site

            site = Site.objects.get(pk=settings.SITE_ID)
            domain = getattr(settings, 'SITE_DOMAIN', '') or 'localhost:8000'
            name = getattr(settings, 'SITE_NAME', '') or domain
            if site.domain != domain or site.name != name:
                site.domain = domain
                site.name = name
                site.save(update_fields=['domain', 'name'])
        except Exception:
            pass
