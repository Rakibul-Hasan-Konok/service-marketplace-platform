# Full-Stack Service Marketplace Platform

A complete multi-tenant service marketplace built for **Assessment 4: Full-Stack Service Marketplace (Vibe Coding Challenge)**. The platform is inspired by Sheba.xyz and supports Admin, Vendor, and End-User workflows with role-based access control, service discovery, vendor service management, checkout, and sandbox payment processing.

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT-based authentication and role-based authorization
- Payment: Mock sandbox payment gateway
- Containerization: Docker Compose

## Project Structure

```text
service-marketplace-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── middleware/
│       ├── routes/
│       ├── schemas/
│       └── server.ts
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── store/
├── docs/
│   ├── erd.md
│   ├── vibe-coding-notes.md
│   └── demo-checklist.md
└── docker-compose.yml
```

## Seeded Login Credentials

Password for all seeded accounts:

```text
Test@12345
```

| Role | Email |
|---|---|
| Admin | admin@test.com |
| Vendor | vendor1@test.com |
| Vendor | vendor2@test.com |
| Vendor, unverified by default | vendor3@test.com |
| End-User | user1@test.com |
| End-User | user2@test.com |

## Run with Docker Compose

From the project root:

```powershell
docker compose down -v
docker compose up --build
```

Open a second terminal in the same project root and run database migration + seed:

```powershell
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

Open:

```text
Frontend: http://localhost:3000
Backend health: http://localhost:4000/api/health
Services API: http://localhost:4000/api/services
```

## Important Docker Notes

If Docker Desktop cache becomes corrupted and image export fails, run:

```powershell
docker compose down
docker builder prune -a -f
docker image prune -a -f
docker volume prune -f
```

Then restart Docker Desktop and run:

```powershell
docker compose up --build
```

## Main Functional Requirements Covered

### Authentication and RBAC

- Signup and login with JWT token
- Three roles: `ADMIN`, `VENDOR`, `END_USER`
- Backend role middleware protects admin, vendor, and user APIs
- Frontend role guard protects restricted pages

### Admin

- View platform stats
- View users
- Verify or suspend vendors

### Vendor

- View vendor dashboard
- Create and deactivate services
- Manage prices and descriptions
- View received jobs/orders
- Update job status to confirmed, completed, or cancelled

### End-User

- Browse service catalog
- Search and filter services by category
- View service details
- Book service through checkout
- Complete mock sandbox payment
- View personal order history

### Service Discovery

- Public services catalog
- Search by title/description
- Category filtering
- Only active services from verified, non-suspended vendors appear publicly

### Checkout and Sandbox Payment

- End-user selects service
- Chooses schedule date/time
- Uses mock payment gateway
- Successful payment creates a `CONFIRMED` order and `SUCCESS` transaction
- Failed payment creates a non-confirmed result with sandbox error handling

## API Routes

Public:

```text
GET  /api/health
GET  /api/categories
GET  /api/services
GET  /api/services/:id
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

End-User:

```text
GET  /api/user/profile
GET  /api/user/orders
POST /api/user/bookings
POST /api/user/checkout
```

Vendor:

```text
GET    /api/vendor/dashboard
GET    /api/vendor/services
POST   /api/vendor/services
PUT    /api/vendor/services/:id
DELETE /api/vendor/services/:id
GET    /api/vendor/orders
PATCH  /api/vendor/orders/:id/status
```

Admin:

```text
GET   /api/admin/stats
GET   /api/admin/users
GET   /api/admin/vendors
PATCH /api/admin/vendors/:id
```

## Demo Video Flow

1. Login as Admin: `admin@test.com / Test@12345`.
2. Show admin dashboard, users, and vendor verification/suspension page.
3. Login as Vendor: `vendor1@test.com / Test@12345`.
4. Show vendor dashboard and create a service, for example:
   - Title: AC Cleaning
   - Description: Professional AC cleaning service
   - Category: AC Repair
   - Price: 1500
5. Login as End-User: `user1@test.com / Test@12345`.
6. Open Services page, search `AC`, open service details.
7. Click Book Now, choose date/time, pay with mock gateway.
8. Open My Orders and show confirmed order.
9. Login as Vendor again and show the job in Received Jobs.
10. Mark the job as completed.
11. Login as Admin and show stats updated.

## Assessment Explanation Files

- `docs/erd.md`: database schema and relationship explanation
- `docs/vibe-coding-notes.md`: AI/vibe coding workflow explanation
- `docs/demo-checklist.md`: demo recording checklist

## Troubleshooting

### Services page shows no services

Run seed again:

```powershell
docker compose exec backend npm run seed
```

Make sure vendors are verified and not suspended from Admin → Vendors.

### Vendor login says account suspended

Login as admin and toggle the vendor suspension status back to false.

### Book Now fails

Make sure you are logged in as an End-User, not Admin or Vendor.

Use:

```text
user1@test.com / Test@12345
```

### VS Code shows red TypeScript errors

Install local dependencies for editor IntelliSense:

```powershell
cd frontend
npm install
cd ../backend
npm install
```

Then restart VS Code.
