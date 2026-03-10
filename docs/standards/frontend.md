# Frontend Standard Approach

## React Native + Expo

This document defines a practical standard for building scalable, maintainable, and safe frontend apps using **React Native with Expo**.

---

## 1. Goals

Use this standard to:

- keep the codebase clean and predictable
- reduce bugs from duplicated logic
- prevent multiple submissions from users
- make API calls consistent
- improve maintainability as the app grows
- make onboarding easier for new developers

---

## 2. Recommended Stack

- **Framework:** Expo + React Native
- **Language:** TypeScript
- **Routing:** Expo Router
- **State Management:** Zustand for app state, React Query/TanStack Query for server state
- **Forms:** React Hook Form + Zod
- **Networking:** Axios or fetch wrapped in a reusable API client
- **Storage:** SecureStore for sensitive tokens, AsyncStorage for non-sensitive cache
- **UI:** Reusable design system/components
- **Testing:** Jest + React Native Testing Library
- **Linting/Formatting:** ESLint + Prettier

---

## 3. Recommended Folder Structure

```text
src/
  app/                  # Expo Router screens/routes
  components/           # Shared UI components
  features/             # Feature-based modules
    auth/
      api/
      components/
      hooks/
      schemas/
      types/
      screens/
    orders/
    profile/
  services/
    api/
      client.ts
      interceptors.ts
      endpoints.ts
  hooks/
  store/
  utils/
  constants/
  types/
```

### Rule

Keep code **feature-based**. Shared logic goes into `components`, `services`, `hooks`, or `utils`. Feature-specific logic stays inside the feature folder.

---

## 4. General Coding Standards

### Naming

- `PascalCase` for components
- `camelCase` for functions and variables
- `UPPER_SNAKE_CASE` for constants
- File names should reflect their responsibility

Examples:

- `SubmitButton.tsx`
- `useLogin.ts`
- `auth.schema.ts`
- `order.service.ts`

### Rules

- One component = one responsibility
- Avoid large screens with mixed logic
- Move API calls out of UI files
- Move validation schemas out of components
- Avoid inline business logic in JSX
- Prefer small reusable hooks over repeated code

---

## 5. Screen Pattern

Each screen should mainly do these things:

1. render UI
2. call hooks
3. connect form submission to the API
4. show loading, success, and error states

Avoid placing the following directly in the screen:

- direct Axios setup
- raw validation rules
- repeated transformation logic
- duplicate request guards copied from other screens

---

## 6. Form Submission Standard

This is one of the most important parts.

### Problem

Users may tap the submit button multiple times due to:

- slow internet
- laggy device
- no loading state
- accidental double-tap

This can create:

- duplicate orders
- duplicate payments
- repeated records
- inconsistent backend data

### Frontend Protection Rules

Always implement **all** of the following:

#### A. Disable the button while submitting

```tsx
<Button
  disabled={isSubmitting || mutation.isPending}
  onPress={handleSubmit(onSubmit)}
>
  {mutation.isPending ? "Submitting..." : "Submit"}
</Button>
```

#### B. Use a single submission guard

```tsx
const isLockedRef = useRef(false);

const onSubmit = async (values: FormValues) => {
  if (isLockedRef.current) return;

  isLockedRef.current = true;
  try {
    await mutation.mutateAsync(values);
  } finally {
    isLockedRef.current = false;
  }
};
```

#### C. Show visual feedback immediately

- loading spinner
- disabled button
- “Submitting...” label
- toast after success/failure

#### D. Prefer mutation-based submission

Use React Query/TanStack Query mutation handlers instead of ad hoc request calls inside components.

```tsx
const createOrder = useMutation({
  mutationFn: orderApi.create,
});
```

---

## 7. Idempotency Support From Frontend

For critical actions such as:

- payments
- order placement
- booking creation
- account creation
- gate pass generation
- anything that should happen only once

send an **idempotency key** with the request.

### Example

```ts
import { v4 as uuidv4 } from "uuid";

const idempotencyKey = uuidv4();

await apiClient.post("/orders", values, {
  headers: {
    "X-Idempotency-Key": idempotencyKey,
  },
});
```

### Why this matters

If the user taps twice or the request retries, the backend can detect that the same intent was already processed.

---

## 8. API Layer Standard

Never scatter raw HTTP calls across screens.

### Use a centralized client

```ts
// services/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
});
```

### Feature API wrapper

```ts
// features/orders/api/orderApi.ts
import { apiClient } from "@/services/api/client";

export const orderApi = {
  create: async (payload: CreateOrderPayload) => {
    const res = await apiClient.post("/orders", payload);
    return res.data;
  },
};
```

### Benefits

- easier token handling
- easier retry rules
- easier logging
- consistent error parsing

---

## 9. Request and Response Handling

Always normalize API responses.

Expected response style:

```json
{
  "success": true,
  "message": "Order created successfully.",
  "data": {}
}
```

or

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Frontend rule

Convert backend errors into a standard UI-friendly shape before showing them.

---

## 10. Validation Standard

Use shared schemas for forms.

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

Connect to React Hook Form using a resolver.

### Why

- cleaner forms
- reusable validation
- type inference
- fewer mismatches between UI and API expectations

---

## 11. Authentication Standard

- store access tokens securely
- never hardcode secrets
- refresh tokens using a controlled flow
- clear auth state on logout
- handle `401` centrally in the API layer

Sensitive values should use **SecureStore**, not plain AsyncStorage.

---

## 12. Navigation Standard

With Expo Router:

- keep route files simple
- avoid business logic in route files
- use route groups for authenticated/public areas

Example:

```text
app/
  (public)/
    login.tsx
  (protected)/
    home.tsx
    orders/
      index.tsx
```

---

## 13. Offline and Network Handling

At minimum:

- detect no internet
- show clear message before submission
- do not silently fail
- prevent repeated retries from hammering the backend

For critical queued actions, define whether retry is automatic or manual.

---

## 14. Loading and Error UX Rules

Every API-based screen should define:

- initial loading state
- empty state
- error state
- retry action when appropriate

For forms:

- field validation errors should appear near fields
- server errors should appear clearly and not be swallowed
- success state should be obvious

---

## 15. Security Best Practices

- never trust frontend-only validation
- never expose private API keys in Expo public env values
- sanitize user-generated content when displayed
- do not log tokens in console
- do not keep sensitive data longer than needed
- use HTTPS only

---

## 16. Performance Best Practices

- memoize expensive derived values when needed
- use `FlashList` or optimized lists for large datasets
- avoid unnecessary rerenders
- avoid anonymous inline callbacks in large repeated lists when performance matters
- paginate server data instead of loading everything at once

---

## 17. Testing Minimum Standard

Each important feature should have:

- validation tests for schema logic
- hook or mutation tests for submission flow
- screen tests for loading/error/success behavior

At least test these for forms:

- invalid input
- duplicate tap attempt
- success response
- backend validation error
- timeout or network failure

---

## 18. Logging and Monitoring

Recommended:

- central error logging
- distinguish validation errors from system errors
- add request IDs or idempotency keys when debugging duplicates

Never log passwords, tokens, or personal sensitive data.

---

## 19. Example Submission Pattern

```tsx
const mutation = useMutation({
  mutationFn: async (payload: CreateRequest) => {
    const idempotencyKey = crypto.randomUUID();

    return apiClient.post("/requests", payload, {
      headers: {
        "X-Idempotency-Key": idempotencyKey,
      },
    });
  },
});

const onSubmit = handleSubmit(async (values) => {
  if (mutation.isPending) return;

  try {
    await mutation.mutateAsync(values);
    Alert.alert("Success", "Your request was submitted successfully.");
    reset();
  } catch (error) {
    handleApiError(error);
  }
});
```

---

## 20. Team Rules

### Must do

- use TypeScript
- use FormRequest-compatible payload shapes
- use shared API client
- use feature folders
- disable buttons during submission
- send idempotency keys for critical create actions
- show loading and error states
- use reusable response/error handling

### Avoid

- direct API calls in JSX files everywhere
- repeated submission logic copy-pasted in screens
- storing secrets in public env files
- mixing navigation, API, and business logic in one file
- allowing repeated submissions for sensitive actions

---

## 21. Definition of Done

A frontend feature is done when:

- UI works on iOS and Android
- inputs are validated
- duplicate submissions are prevented
- API success and error states are handled
- loading state is clear
- code is split properly
- no secrets are exposed
- test coverage exists for critical flows

---

## 22. Final Recommendation

For the best long-term setup, combine:

- **Expo Router** for navigation
- **TypeScript** for safety
- **React Hook Form + Zod** for forms
- **TanStack Query** for API mutations and caching
- **central API client** for requests
- **idempotency key strategy** for critical submissions
- **backend validation and unique constraints** as final protection

Frontend should prevent accidental duplicate actions, but the backend must still be the final source of truth.
