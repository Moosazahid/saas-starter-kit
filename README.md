# SaaS Starter Kit

A production-ready SaaS boilerplate built with Next.js 14, NestJS, Stripe, and PostgreSQL.

![CI](https://github.com/Moosazahid/saas-starter-kit/actions/workflows/ci.yml/badge.svg)

## 🚀 Live Demo
- **Frontend:** coming soon
- **API Docs:** coming soon

## ✨ Features

- **Authentication** — JWT access + refresh tokens, bcrypt password hashing
- **Multi-tenant** — Organizations, team invites, RBAC (OWNER/ADMIN/MEMBER)
- **Stripe Billing** — Checkout sessions, webhooks, customer portal
- **Dashboard** — Beautiful Next.js UI with shadcn/ui components
- **API Docs** — Auto-generated Swagger documentation
- **CI/CD** — GitHub Actions pipeline on every PR

## 🛠 Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Hook Form + Zod

**Backend**
- NestJS
- PostgreSQL + Prisma ORM
- Redis
- Stripe
- JWT Authentication
- Swagger/OpenAPI

**DevOps**
- Docker + Docker Compose
- GitHub Actions CI/CD

## 🏃 Quick Start

**Prerequisites:** Node.js 20+, Docker Desktop

```bash
# Clone the repo
git clone https://github.com/Moosazahid/saas-starter-kit.git
cd saas-starter-kit

# Set up environment
cp apps/api/.env.example apps/api/.env
# Fill in your values in apps/api/.env

# Start databases
docker compose up -d

# Install dependencies
cd apps/api && npm install
cd ../web && npm install

# Run migrations
cd ../api && npx prisma migrate dev

# Start development servers
# Terminal 1 - API
cd apps/api && npm run start:dev

# Terminal 2 - Web
cd apps/web && npm run dev
```

Open http://localhost:3000

## 📁 Project Structure
saas-starter-kit/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # NestJS backend
│       ├── src/
│       │   ├── auth/       # JWT auth, guards, strategies
│       │   ├── billing/    # Stripe integration
│       │   ├── orgs/       # Multi-tenant org system
│       │   └── prisma/     # Database service
│       └── prisma/
│           └── schema.prisma
├── docker-compose.yml
└── .github/
└── workflows/
└── ci.yml

## 🔑 Environment Variables

\```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_db
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
\```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login with email/password |
| POST | /auth/refresh | Refresh access token |
| GET | /auth/me | Get current user |
| POST | /billing/checkout | Create Stripe checkout |
| GET | /billing/subscription | Get subscription status |
| POST | /orgs | Create organization |
| POST | /orgs/:id/invite | Invite team member |
| DELETE | /orgs/:id/members/:userId | Remove member |

Full API docs at http://localhost:3001/api/docs

## 🔄 CI/CD

Every pull request automatically:
1. Spins up PostgreSQL + Redis
2. Runs Prisma migrations
3. Lints and builds the API
4. Type checks the frontend

## 📄 License

MIT