# Enterprise HR Management System

Production-grade Angular 21 + Node.js + Express + MongoDB HRMS scaffold with standalone components, signals, RBAC, JWT auth, Socket.IO, uploads, PDF payslips, audit logging, Docker, and CI.

## Quick Start

1. Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB Atlas connection string.
2. Install dependencies with `npm install`.
3. Seed sample users and employees with `npm run seed`.
4. Start both apps with `npm run dev`, or run `npm run dev:client` and `npm run dev:api` separately.

Default seeded credentials use `Password@123`:

- `admin@company.com` as Super Admin
- `hr@company.com` as HR
- `manager@company.com` as Manager
- `employee@company.com` as Employee

## Architecture

Frontend lives under `src/app` with `core`, `shared`, `features`, `layout`, `guards`, `interceptors`, `state`, `models`, and `utils`. Routes are lazy loaded, auth is signal-backed, and RBAC is enforced with functional guards.

Backend lives under `server/src` with controllers, services, repositories, models, middlewares, routes, validators, sockets, utilities, logs, and scripts. It uses Helmet, CORS, rate limiting, compression, Mongo sanitization, Joi validation, Winston logging, Mongoose indexing, JWT auth, RBAC, Socket.IO events, Multer uploads, and PDFKit generation.

## API Surface

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `POST /api/leave/apply`
- `PUT /api/leave/approve/:id`
- `GET /api/leave/history`
- `POST /api/attendance/checkin`
- `POST /api/attendance/checkout`
- `GET /api/attendance/report`
- `POST /api/payroll/process`
- `GET /api/payroll/payslip/:id`

## Docker

Use MongoDB Atlas by setting `MONGO_URI` in `.env`, or use the local MongoDB service from Compose.

```bash
docker compose up --build
```

## Notes

The frontend currently includes operational enterprise screens and reusable primitives. Backend endpoints are layered and ready for deeper workflow hardening such as email providers, calendar providers, Excel exports, and AI assistant integrations.
