# Testing

## Frontend

### Framework

- **Test runner**: Vitest 1.x (`vitest`)
- **DOM environment**: jsdom (`"environment": "jsdom"` in vite.config.ts)
- **Assertion library**: `@testing-library/jest-dom` (extended matchers)
- **Component testing**: `@testing-library/react`
- **Coverage**: `@vitest/coverage-v8`

### Configuration

- Setup file: `frontend/src/__tests__/setup.ts` (imports jest-dom matchers)
- Run tests: `npm test` (watch mode) or `npm run coverage`

### Structure

- Single test file: `frontend/src/__tests__/app.test.tsx`
- Test setup: `frontend/src/__tests__/setup.ts`

### Patterns

```tsx
// Module mocking pattern
vi.mock("../api/cvApi", () => ({
  uploadAndParseCV: vi.fn(),
  getMyCVList: vi.fn(() => Promise.resolve([])),
  isAuthenticated: vi.fn(() => false),
}));

// Component render test
describe("Welcome page", () => {
  it("renders heading", async () => {
    const { default: Welcome } = await import("../pages/Welcome");
    render(React.createElement(Welcome));
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});

// Hook existence check (minimal)
describe("useCVUpload hook", () => {
  it("should start in idle state", async () => {
    const { useCVUpload } = await import("../hooks/useCVUpload");
    expect(typeof useCVUpload).toBe("function");
  });
});
```

### Coverage

- Coverage is minimal — only a handful of smoke tests
- No tests for: auth flows, CV upload end-to-end, Stripe checkout, i18n rendering
- Dynamic imports used in tests to avoid module-level side effects

## Backend

### Framework

- **Test runner**: Django's built-in test runner (`python manage.py test`)
- **API testing**: `rest_framework.test.APITestCase` + `APIClient`
- **Unit testing**: `django.test.TestCase`
- **Mocking**: `unittest.mock.patch`, `MagicMock`

### Structure

- Single test file: `backend/api/tests.py`

### Patterns

```python
# Helper pattern
def create_test_user(email="test@test.it", password="TestPass123!"):
    return User.objects.create_user(email=email, password=password)

def get_auth_header(client: APIClient, email="test@test.it", ...):
    """Returns HTTP_AUTHORIZATION header dict for JWT auth."""
    response = client.post('/auth/token/', {'email': email, 'password': password})
    token = response.data.get('access')
    return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

# API test pattern
class CVUploadTest(APITestCase):
    def setUp(self):
        self.user = create_test_user()
        self.headers = get_auth_header(self.client)

    def test_upload_requires_auth(self):
        response = self.client.post('/api/v1/upload/')
        self.assertEqual(response.status_code, 401)
```

### Coverage

- Auth endpoints, CV upload, and basic API endpoint access tested
- No tests for: Stripe webhooks, job matching logic, email sending, admin views
- Services tested indirectly via view tests (no unit tests for `services/`)

## Running Tests

```bash
# Frontend
cd frontend
npm test           # watch mode
npm run coverage   # with coverage report

# Backend
cd backend
python manage.py test api
```

## Gaps

- No CI pipeline enforcing test runs (no `.github/workflows/` or similar)
- No integration tests across frontend ↔ backend
- No E2E tests (Playwright/Cypress)
- Frontend coverage tooling configured but no coverage thresholds enforced
