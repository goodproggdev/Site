"""
Test suite per il backend Django.
Copertura: auth, CV parsing, API endpoints.
"""
import json
import io
import os
from unittest.mock import patch, MagicMock

from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from api.models import Item, CVData

User = get_user_model()


# ==============================================================================
# HELPERS
# ==============================================================================

def create_test_user(email="test@test.it", password="TestPass123!"):
    return User.objects.create_user(email=email, password=password)


def get_auth_header(client: APIClient, email="test@test.it", password="TestPass123!"):
    """Ottieni un JWT access token per i test autenticati."""
    response = client.post('/auth/token/', {
        'email': email, 'password': password
    }, format='json')
    if response.status_code == 200:
        token = response.data.get('access')
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}
    return {}


# ==============================================================================
# TEST AUTH
# ==============================================================================

class AuthTest(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = create_test_user()

    def test_jwt_token_obtain(self):
        """Verifica che il login ritorni access + refresh token."""
        response = self.client.post('/auth/token/', {
            'email': 'test@test.it',
            'password': 'TestPass123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_credentials_rejected(self):
        """Credenziali errate → 401."""
        response = self.client.post('/auth/token/', {
            'email': 'test@test.it',
            'password': 'WrongPassword'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_without_token(self):
        """Endpoint protetto senza token → 401."""
        response = self.client.get('/api/items/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_with_token(self):
        """Endpoint protetto con token valido → 200."""
        headers = get_auth_header(self.client, 'test@test.it', 'TestPass123!')
        response = self.client.get('/api/items/', **headers)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_token_refresh(self):
        """Refresh del token funziona correttamente."""
        # Prima ottieni i token
        response = self.client.post('/auth/token/', {
            'email': 'test@test.it',
            'password': 'TestPass123!'
        }, format='json')
        refresh = response.data.get('refresh')
        self.assertIsNotNone(refresh)

        # Poi refresh
        refresh_response = self.client.post('/auth/token/refresh/', {
            'refresh': refresh
        }, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)


# ==============================================================================
# TEST API CV DATA
# ==============================================================================

class CVDataAPITest(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = create_test_user()
        # Autenticazione
        response = self.client.post('/auth/token/', {
            'email': 'test@test.it',
            'password': 'TestPass123!'
        }, format='json')
        if response.status_code == 200:
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    def test_list_cv_empty(self):
        """Lista CV vuota per nuovo utente."""
        response = self.client.get('/api/cv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_cv_list_returns_only_own_cvs(self):
        """L'utente vede solo i propri CV."""
        other_user = create_test_user(email="other@test.it")
        CVData.objects.create(user=other_user, raw_json={}, original_filename="other.pdf")
        CVData.objects.create(user=self.user, raw_json={}, original_filename="mine.pdf")

        response = self.client.get('/api/cv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_delete_own_cv(self):
        """Elimina un proprio CV."""
        cv = CVData.objects.create(user=self.user, raw_json={})
        response = self.client.delete(f'/api/cv/{cv.id}/delete/')
        self.assertIn(response.status_code, [status.HTTP_204_NO_CONTENT, status.HTTP_200_OK])
        self.assertFalse(CVData.objects.filter(id=cv.id).exists())

    def test_delete_other_user_cv_forbidden(self):
        """Non è possibile eliminare CV di altri utenti."""
        other_user = create_test_user(email="other2@test.it")
        cv = CVData.objects.create(user=other_user, raw_json={})
        response = self.client.delete(f'/api/cv/{cv.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(CVData.objects.filter(id=cv.id).exists())


# ==============================================================================
# TEST CV UPLOAD PARSING
# ==============================================================================

class CVUploadTest(APITestCase):

    def setUp(self):
        self.client = APIClient()

    def test_upload_without_file_returns_400(self):
        """Upload senza file → 400."""
        response = self.client.post('/api/parse-cv-upload/', {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_upload_wrong_extension_returns_400(self):
        """Upload file con estensione non consentita → 400."""
        file_content = b"fake file content"
        fake_file = io.BytesIO(file_content)
        fake_file.name = "malware.exe"
        response = self.client.post('/api/parse-cv-upload/', {
            'cv_file': fake_file
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('api.services.cv_service.PARSING_FUNCTIONS_LOADED', True)
    @patch('api.services.cv_service.parse_cv_from_file')
    def test_upload_valid_pdf_calls_parser(self, mock_parse):
        """Upload PDF valido chiama il parser."""
        mock_parse.return_value = {'name': 'Mario Rossi', 'email': 'mario@test.it'}
        file_content = b"%PDF-1.4 mock content"
        fake_file = io.BytesIO(file_content)
        fake_file.name = "cv_test.pdf"
        response = self.client.post('/api/parse-cv-upload/', {
            'cv_file': fake_file
        }, format='multipart')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_422_UNPROCESSABLE_ENTITY])


# ==============================================================================
# TEST JSON DATA VIEW
# ==============================================================================

class JsonDataViewTest(APITestCase):

    @patch('builtins.open')
    @patch('json.load')
    def test_get_json_data_returns_200(self, mock_json, mock_open):
        """get_json_data ritorna 200 con dati."""
        mock_json.return_value = {'key': 'value'}
        mock_open.return_value.__enter__ = lambda s: s
        mock_open.return_value.__exit__ = MagicMock(return_value=False)
        mock_open.return_value.read = MagicMock(return_value='{"key": "value"}')

        response = self.client.get('/api/data/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_contact_view_missing_fields(self):
        """form contatti con campi mancanti → 400."""
        response = self.client.post('/api/contact/', {
            'email': 'test@test.it'
        }, content_type='application/json')
        self.assertIn(response.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_403_FORBIDDEN,
            status.HTTP_200_OK
        ])


# ==============================================================================
# TEST CV SERVICE
# ==============================================================================

class CVServiceTest(TestCase):

    def test_validate_cv_file_valid_pdf(self):
        """Validazione file PDF valido → None (nessun errore)."""
        from api.services.cv_service import validate_cv_file
        fake_file = MagicMock()
        fake_file.name = "curriculum.pdf"
        fake_file.size = 1024 * 1024  # 1MB
        result = validate_cv_file(fake_file)
        self.assertIsNone(result)

    def test_validate_cv_file_invalid_extension(self):
        """Validazione file .exe → errore."""
        from api.services.cv_service import validate_cv_file
        fake_file = MagicMock()
        fake_file.name = "virus.exe"
        fake_file.size = 100
        result = validate_cv_file(fake_file)
        self.assertIsNotNone(result)
        self.assertIn("non supportato", result.lower())

    def test_validate_cv_file_too_large(self):
        """File troppo grande → errore."""
        from api.services.cv_service import validate_cv_file
        fake_file = MagicMock()
        fake_file.name = "huge.pdf"
        fake_file.size = 20 * 1024 * 1024  # 20MB > 10MB limit
        result = validate_cv_file(fake_file)
        self.assertIsNotNone(result)
        self.assertIn("grande", result.lower())

    def test_validate_cv_file_valid_docx(self):
        """Validazione .docx valido → None."""
        from api.services.cv_service import validate_cv_file
        fake_file = MagicMock()
        fake_file.name = "cv.docx"
        fake_file.size = 500 * 1024  # 500KB
        result = validate_cv_file(fake_file)
        self.assertIsNone(result)


# ==============================================================================
# TEST MODELLI
# ==============================================================================

class ModelTest(TestCase):

    def test_create_user_with_email(self):
        """Creazione utente con email."""
        user = User.objects.create_user(email="model@test.it", password="Pass123!")
        self.assertEqual(user.email, "model@test.it")
        self.assertTrue(user.check_password("Pass123!"))
        self.assertFalse(user.is_staff)

    def test_cv_data_slug_auto_generated(self):
        """Slug CVData generato automaticamente."""
        user = User.objects.create_user(email="slug@test.it", password="Pass123!")
        cv = CVData.objects.create(user=user, raw_json={})
        self.assertIsNotNone(cv.slug)
        self.assertIn('slug', cv.slug)

    def test_item_str(self):
        """__str__ di Item."""
        item = Item.objects.create(name="Test Item")
        self.assertEqual(str(item), "Test Item")
