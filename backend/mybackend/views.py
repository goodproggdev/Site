from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

@api_view(['POST'])
@parser_classes([MultiPartParser])
def analyze_cv(request):
	if 'document' not in request.data:
		return Response({'error':'Nessun file inviato'}, status=400)
	document = request.data['document']
	# Esegui l'analisi del documento qui
	result = {'message':'Documento analizzato con successo'}
	return Response(result)
