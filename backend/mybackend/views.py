from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.core.mail import send_mail
import socket
import smtplib
import json

@api_view(['POST'])
@parser_classes([MultiPartParser])
def analyze_cv(request):
	if 'document' not in request.data:
		return Response({'error':'Nessun file inviato'}, status=400)
	document = request.data['document']
	# Esegui l'analisi del documento qui
	result = {'message':'Documento analizzato con successo'}
	return Response(result)


@ensure_csrf_cookie
@csrf_protect
def contact_view(request):
    def check_internet():
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=5)
            return True
        except OSError:
            return False

    if request.method == 'POST':
        try:
            if not check_internet():
                return JsonResponse({'error': 'Nessuna connessione internet'}, status=503)

            data = json.loads(request.body)
            
            email = data.get('email', '').strip()
            subject = data.get('subject', '').strip()
            message = data.get('message', '').strip()

            if not all([email, subject, message]):
                return JsonResponse({'error': 'Compila tutti i campi'}, status=400)

            try:
                send_mail(
                    subject=f"{subject} - From {email}",
                    message=message,
                    from_email=email,
                    recipient_list=['sitiegestionali@gmail.com'],
                    fail_silently=False,
                )
            except smtplib.SMTPException as e:
                error_code = e.smtp_code if hasattr(e, 'smtp_code') else '000'
                return JsonResponse({
                    'error': f"Errore SMTP ({error_code}): Impossibile inviare l'email",
                    'details': str(e)
                }, status=503)

            return JsonResponse({'status': 'success'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato dati non valido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'status': 'csrf cookie set'})