from django.http import JsonResponse

def test_home(request):
    return JsonResponse({
        'message': f'Benvenuto nel sottodominio TEST! Subdomain: {request.subdomain}',
        'endpoints': ['/dashboard/', '/api/']
    })

def test_dashboard(request):
    return JsonResponse({'status': 'test_dashboard', 'data': 'solo per sottodominio test'})