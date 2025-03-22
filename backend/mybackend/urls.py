"""
URL configuration for mybackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
"""
URL configuration for mybackend project.
"""
from django.contrib import admin
from django.urls import path, include
from .views import analyze_cv, contact_view, upload_file
from django.conf import settings
from django.conf.urls.static import static

def include_subdomain(subdomain, module):
    def include_patterns(request):
        if request.subdomain == subdomain:
            return include(module)
        return None
    return include_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
#    path('api/', include('api.urls')),
    path('upload/', upload_file, name='upload_file'),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/analyze-cv/', analyze_cv, name='analyze-cv'),
    path('api/contact/', contact_view, name='contact')

 #   re_path(r'^.*$', include_subdomain('test', 'test_app.urls')),
 #   re_path(r'^.*$', include_subdomain(None, 'main_app.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)