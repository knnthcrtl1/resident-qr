# Backend Standard Approach

## Laravel API

This document defines a practical standard for building scalable, maintainable, and safe backend services using Laravel.

---

## 1. Goals

Use this standard to:

- keep API behavior consistent
- prevent duplicate writes and race conditions
- centralize validation and error handling
- improve maintainability as modules grow
- make onboarding easier for new developers

---

## 2. Recommended Stack

- Framework: Laravel 12
- Language: PHP 8.2+
- Auth: Laravel Sanctum
- Admin: Filament (optional back office)
- Queue: Laravel queue workers for async jobs
- Testing: PHPUnit feature and unit tests
- Linting/formatting: Laravel Pint

---

## 3. Architecture Rules

Suggested structure:

```text
app/
  Http/
    Controllers/
    Requests/
    Resources/
  Services/
  Models/
  Policies/
  Jobs/
routes/
  api.php
tests/
  Feature/
  Unit/
```

Rules:

- Controllers orchestrate only.
- Validation belongs in Form Requests.
- Business logic belongs in Services.
- Response transformation belongs in Resources.

---

## 4. API Response Standard

Success:

```json
{
  "success": true,
  "message": "Operation completed.",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field": ["Error message"]
  }
}
```

Use proper HTTP status codes (`200`, `201`, `401`, `403`, `404`, `409`, `422`, `500`).

---

## 5. Validation and Security

- Always use Form Request classes for write endpoints.
- Never trust `$request->all()` for business operations.
- Authorize actions with policies/gates.
- Keep secrets only in env vars.
- Never log tokens, passwords, or sensitive PII.

---

## 6. Duplicate Submission Protection

For critical create actions (payments, bookings, passes):

- Accept `X-Idempotency-Key` from the client.
- Return original response for repeated key + user + route.
- Enforce database uniqueness with indexes.
- Use transactions for multi-step writes.

Frontend protection helps, but backend remains final source of truth.

---

## 7. Database and Performance

- Use migrations for all schema changes.
- Add indexes for common filters/joins.
- Prevent N+1 queries with eager loading.
- Paginate list endpoints.
- Move heavy work to queues.

---

## 8. Testing Minimum

Each important feature should include:

- feature tests for endpoint behavior
- validation tests for invalid payloads
- authorization tests
- idempotency/duplicate-submission tests
- unit tests for core service logic

---

## 9. Team Rules

Must do:

- use Form Requests
- keep controllers thin
- keep response shape consistent
- use transactions for multi-write operations
- run Pint lint and tests before merge

Avoid:

- fat controllers with business logic
- inconsistent error shapes
- silent catch blocks
- relying on frontend-only validation

---

## 10. Definition of Done

A backend feature is done when:

- validation and authorization are implemented
- success/error responses follow the standard
- duplicate submission is handled where relevant
- tests cover happy path and edge cases
- lint and tests pass

---

## 11. Local Commands

From repo root:

```bash
pnpm lint:frontend
pnpm lint:backend
pnpm lint
```

From backend folder:

```bash
composer run lint
composer run format
composer run test
```