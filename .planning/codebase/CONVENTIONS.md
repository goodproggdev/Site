# Conventions

## Language

- **Code language**: English (identifiers, type names, file names)
- **Comments and docstrings**: Italian (both frontend and backend)
- **User-facing strings**: All in i18n translation files — never hardcoded

## Frontend (TypeScript / React)

### TypeScript

- Strict mode enabled (`"strict": true`, `noUnusedLocals`, `noUnusedParameters`)
- Explicit interface definitions for all props and API types (see `src/api/types.ts`)
- No `any` — use `unknown` with type narrowing when needed
- Types/interfaces use PascalCase: `UploadButtonProps`, `ParseCVResponse`

### Components

- Functional components only — no class components
- Props typed via `interface`, not `type` alias
- Component files named `PascalCase.tsx` matching export name
- Barrel `index.ts` re-exports in `components/` and `pages/`

```tsx
// Pattern: typed props + default params
interface UploadButtonProps {
  buttonClassName?: string;
  buttonText?: string;
}
const UploadButton: React.FC<UploadButtonProps> = ({
  buttonClassName = "btn-secondary",
}) => { ... };
export default UploadButton;
```

### Hooks

- Custom hooks in `src/hooks/`, named `useXxx.ts`
- State machine pattern for async ops: `"idle" | "uploading" | "success" | "error"`
- `useCallback` on functions passed to children or used in `useEffect` deps

### API Layer

- All HTTP calls go through `src/api/cvApi.ts` — never call `fetch`/`axios` directly in components
- Axios instance with baseURL from `VITE_API_BASE_URL` env var
- JWT injected via request interceptor; auto-refresh via response interceptor

### Styling

- Tailwind CSS utility classes — no custom CSS files except `index.css` for global resets and design tokens
- Flowbite React component library for UI primitives (Modal, FileInput, etc.)
- Dark mode supported via Tailwind's `dark:` prefix

### i18n

- All user-facing text via `useTranslation()` hook: `const { t } = useTranslation()`
- Translation keys are namespaced: `components.uploadButton.title`, `errors.upload.generic`
- Backend error messages localized via `src/utils/apiErrorI18n.ts`

### Error Handling

- Async ops in hooks use `try/catch` with typed error: `catch (err: unknown)`
- User-visible errors set into state string; never `console.error` in components
- `ErrorBoundary` wraps the full app for uncaught render errors

### Linting

- ESLint with `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-tailwindcss`
- Prettier with `prettier-plugin-tailwindcss` for class ordering
- Configured via `frontend/prettier.config.js`

## Backend (Python / Django)

### Structure

- Thin views — business logic in `api/services/`
- Views use DRF class-based views (`generics.ListCreateAPIView`, `APIView`) or `@api_view` decorators
- Permissions declared explicitly on each view: `permission_classes = [IsAuthenticated]` or `[AllowAny]`

```python
# Pattern: thin view + service delegation
class CVUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        validate_cv_file(file)                      # service call
        result = parse_cv_from_file(file, request.user)  # service call
        return Response(result, status=status.HTTP_200_OK)
```

### Models

- Custom `UserProfile` extends `AbstractBaseUser` (email as `USERNAME_FIELD`)
- UUIDs used for public-facing identifiers where applicable
- `auto_now_add`/`auto_now` for `created_at`/`updated_at` timestamps

### Settings

- Secrets via `python-decouple` (`config('SECRET_KEY')`)
- Database URL via `dj_database_url` for production override
- Environment-specific flags: `DEBUG`, `USE_S3_STORAGE`, `FRONTEND_URL`

### Naming

- Models: `PascalCase` (e.g., `CVData`, `JobMatch`)
- Views: `PascalCase` + suffix (`CVUploadView`, `CVDashboardView`)
- Services: `snake_case` functions (`parse_cv_from_file`, `send_verification_email`)
- URL patterns: kebab-case paths (`/api/v1/cv-upload/`)

### Logging

- `logger = logging.getLogger(__name__)` at module level
- Mix of `logger.info/error` and bare `print()` calls — inconsistent (known concern)

### Error Handling (Backend)

- DRF views return `Response({"error": "..."}, status=4xx)` on failures
- `JsonResponse` used in some function-based views for legacy compatibility
- Exception messages often in Italian
