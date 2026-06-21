# Vibe Coding Notes

## Prompt sequence / strategy

The implementation was broken into phases matching the assessment: database and ERD first, then backend auth/RBAC, business endpoints, frontend pages, state management, setup docs, and verification. Each prompt was scoped to one bounded slice, for example: “create Prisma models and seed data,” then “add JWT middleware with 401/403 separation,” then “build vendor service routes with ownership checks.” This avoids large unreviewable AI output and makes each phase testable.

## AI hallucinations and manual corrections

1. **Wrong Prisma decimal handling**: AI tools often treat `Decimal` fields as plain JavaScript numbers. The backend was written so Prisma receives numeric input and serializes prices safely, while the schema uses `@db.Decimal(10, 2)`.
2. **Incorrect role guard assumption**: A role check alone is not enough for vendor routes. The service update/delete and order status endpoints also filter by `vendorProfileId` to prevent IDOR.
3. **Invented frontend security**: AI-generated route guards can imply security happens in the browser. The frontend can improve UX by hiding wrong-role links, but the backend middleware is the security boundary.
4. **App Router confusion**: Some generated examples mix Pages Router conventions with App Router. This project uses `src/app` route folders and server/client components consistently.
5. **Real Stripe leakage risk**: The assessment allows sandbox mode, but for local safety the payment module is a fully isolated mock gateway that clearly simulates success/failure and never moves real money.

## ERD

See [`/docs/erd.md`](./erd.md) for the Mermaid ERD and design explanation.

## State management and route protection

The frontend uses Zustand for minimal global auth state because only the current token/user needs global access. Server state is loaded directly through small API wrappers and Next.js/server/client components; this keeps the project simple for assessment review. Larger production versions could add React Query for caching, retries, and invalidation.

The UI provides role-aware navigation so Admin, Vendor, and End-User dashboards are visually different at a glance. This is a UX guard only. Real access control is implemented in Express middleware using JWT verification plus `requireRole`, and vendor mutation endpoints additionally verify resource ownership.

## Why both frontend and backend protection are required

Frontend guards stop accidental navigation and make the demo understandable. Backend guards stop direct API abuse. A user can bypass the frontend with curl/Postman, so every protected API route validates authentication, role, and ownership where applicable.
