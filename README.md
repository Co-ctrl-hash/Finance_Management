# Finance Data Processing and Access Control Backend

## 1. Project Overview

Backend API for a finance dashboard with role-based access control, financial record management, and dashboard analytics.

## 2. Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication

## 3. Assumptions and Scope (Step 1)

### Assumptions

- Single currency system: INR.
- Dates are stored in UTC.
- No multi-tenant organization support.
- Users have one role at a time.
- Inactive users cannot access protected endpoints.
- Record deletion is soft delete using `isDeleted`.

### Out of Scope (MVP)

- Refresh tokens
- Forgot password / email verification
- Full audit logging
- Rate limiting
- Multi-currency conversion

## 4. Role and Permission Matrix (Step 1)

- Viewer
  - Can read dashboard summary/trends.
  - Cannot read raw records.
  - Cannot create/update/delete users or records.
- Analyst
  - Can read records and dashboard insights.
  - Cannot create/update/delete records.
  - Cannot manage users.
- Admin
  - Full access to users, records, and dashboard endpoints.

## 5. Data Model Summary

### Enums

- Role: `VIEWER`, `ANALYST`, `ADMIN`
- UserStatus: `ACTIVE`, `INACTIVE`
- RecordType: `INCOME`, `EXPENSE`

### User

- id, name, email, passwordHash
- role, status
- createdAt, updatedAt

### FinancialRecord

- id, amount, currency
- type, category, date, notes
- isDeleted
- createdByUserId
- createdAt, updatedAt

Full schema is defined in `prisma/schema.prisma`.

## 6. API Contract (Step 3)

### Base

- Base URL: `/api/v1`
- Auth: `Bearer <JWT>`
- Content-Type: `application/json`

### Standard Response Formats

#### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

#### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": []
}
```

### 6.1 Auth

#### POST /auth/login

- Access: Public
- Body:

```json
{
  "email": "user@example.com",
  "password": "plainPassword"
}
```

- Success: `200`
- Errors:
  - `400 INVALID_INPUT`
  - `401 INVALID_CREDENTIALS`
  - `403 USER_INACTIVE`

### 6.2 Users (Admin only)

#### POST /users

- Access: `ADMIN`
- Body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "VIEWER | ANALYST | ADMIN"
}
```

- Success: `201`
- Errors:
  - `400 VALIDATION_ERROR`
  - `409 EMAIL_ALREADY_EXISTS`
  - `403 FORBIDDEN`

#### GET /users

- Access: `ADMIN`
- Query Params:
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `role` (optional)
  - `status` (optional)
- Success: `200`
- Errors:
  - `400 INVALID_QUERY`
  - `403 FORBIDDEN`

#### PATCH /users/:id/role

- Access: `ADMIN`
- Body:

```json
{
  "role": "VIEWER | ANALYST | ADMIN"
}
```

- Success: `200`
- Errors:
  - `400 VALIDATION_ERROR`
  - `404 USER_NOT_FOUND`
  - `403 FORBIDDEN`

#### PATCH /users/:id/status

- Access: `ADMIN`
- Body:

```json
{
  "status": "ACTIVE | INACTIVE"
}
```

- Success: `200`
- Errors:
  - `400 VALIDATION_ERROR`
  - `404 USER_NOT_FOUND`
  - `403 FORBIDDEN`

### 6.3 Financial Records

#### POST /records

- Access: `ADMIN`
- Body:

```json
{
  "amount": 1500.75,
  "currency": "INR",
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "optional text"
}
```

- Success: `201`
- Errors:
  - `400 VALIDATION_ERROR`
  - `403 FORBIDDEN`

#### GET /records

- Access: `ANALYST`, `ADMIN`
- Query Params:
  - `type`
  - `category`
  - `fromDate`
  - `toDate`
  - `page` (default `1`)
  - `limit` (default `10`, max `100`)
  - `sortBy` (`date | amount | createdAt`, default `date`)
  - `sortOrder` (`asc | desc`, default `desc`)
- Notes: always filter `isDeleted = false`
- Success: `200`
- Errors:
  - `400 INVALID_QUERY`
  - `403 FORBIDDEN`

#### GET /records/:id

- Access: `ANALYST`, `ADMIN`
- Notes: return `404` if record not found or soft-deleted
- Success: `200`
- Errors:
  - `404 RECORD_NOT_FOUND`
  - `403 FORBIDDEN`

#### PATCH /records/:id

- Access: `ADMIN`
- Body: one or more updatable fields
- Success: `200`
- Errors:
  - `400 VALIDATION_ERROR`
  - `404 RECORD_NOT_FOUND`
  - `403 FORBIDDEN`

#### DELETE /records/:id

- Access: `ADMIN`
- Behavior: soft delete (`isDeleted = true`)
- Success: `200`
- Errors:
  - `404 RECORD_NOT_FOUND`
  - `403 FORBIDDEN`

### 6.4 Dashboard

#### GET /dashboard/summary

- Access: `VIEWER`, `ANALYST`, `ADMIN`
- Query Params:
  - `fromDate` (optional)
  - `toDate` (optional)
- Returns:
  - totalIncome
  - totalExpense
  - netBalance
  - recentActivityCount
- Success: `200`
- Errors:
  - `400 INVALID_QUERY`
  - `403 FORBIDDEN`

#### GET /dashboard/trends

- Access: `VIEWER`, `ANALYST`, `ADMIN`
- Query Params:
  - `period` = `weekly | monthly`
  - `fromDate` (optional)
  - `toDate` (optional)
- Success: `200`
- Errors:
  - `400 INVALID_QUERY`
  - `403 FORBIDDEN`

#### GET /dashboard/category-totals

- Access: `ANALYST`, `ADMIN`
- Query Params:
  - `type` (optional: `INCOME | EXPENSE`)
  - `fromDate` (optional)
  - `toDate` (optional)
- Success: `200`
- Errors:
  - `400 INVALID_QUERY`
  - `403 FORBIDDEN`

## 7. Error Handling Rules

- Use consistent error response shape across all endpoints.
- Return suitable status codes (`400`, `401`, `403`, `404`, `409`, `500`).
- Include validation details when applicable.

## 8. Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Configure environment in `.env`

```env
PORT=5000
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"
JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="1d"
```

3. Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed default admin user

```bash
npm run prisma:seed
```

Default seeded credentials:

- Email: `admin@finance.local`
- Password: `Admin@123`

5. Start development server

```bash
npm run dev
```

## 9. Automated Testing (Step 9)

Integration tests are implemented using Vitest + Supertest in `tests/step9.integration.test.ts`.

Recommended: use a dedicated `.env.test` so test runs do not affect development data.

1. Create `.env.test` from `.env.test.example`
2. Set `DATABASE_URL` to a separate test database
3. Run integration tests with:

```bash
npm run test:integration
```

Covered flows:

- Auth login success/failure
- RBAC enforcement for Admin, Analyst, Viewer
- Records create/update/soft-delete/list behavior
- Dashboard summary/trends/category-totals access and output checks

Run tests:

```bash
npm test
```

Note: tests require a valid PostgreSQL connection via `DATABASE_URL`.

## 10. Assignment Coverage Checklist

- User management with roles (`VIEWER`, `ANALYST`, `ADMIN`) and statuses (`ACTIVE`, `INACTIVE`)
- JWT-based authentication and role-based authorization
- Financial records CRUD with soft delete support
- Filtering, pagination, and sorting for records listing
- Dashboard endpoints for summary, trends, and category totals
- Centralized validation and consistent error response shape
- Prisma/PostgreSQL persistence with indexes for core query paths
- Record CRUD and filters work.
- Dashboard summary and trends work.
- All record and dashboard queries ignore soft-deleted records.
