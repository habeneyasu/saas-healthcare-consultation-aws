# ⚡ AI Platform

> Full-stack AI platform delivering real-time SaaS idea generation and clinical health consultation, powered by Cerebras ultra-fast inference and streamed live as Markdown.

[![CI/CD](https://github.com/habeneyasu/saas-healthcare-consultation-aws/actions/workflows/deploy.yml/badge.svg)](https://github.com/habeneyasu/saas-healthcare-consultation-aws/actions)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.12-blue?logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This platform exposes two AI-powered tools through a unified Next.js interface:

- **SaaS Idea Generator** — generates investor-ready B2B SaaS ideas with pricing tables, MVP scope, and GTM strategy
- **Health Consultation** — produces structured clinical assessments with ranked causes, recommended actions, and urgency classification

Both tools stream responses token-by-token using Cerebras `llama3.1-8b`, delivering results in under 10 seconds.

---

## Features

- Real-time token streaming rendered as live Markdown
- Free tier (unauthenticated) and Pro tier (Clerk-authenticated) with separate rate limits
- Structured prompt templates for consistent, high-quality AI output
- CORS-enabled FastAPI backend deployable as serverless functions
- Dockerized services with a single `docker-compose up` for local development
- Automated CI/CD via GitHub Actions with Docker Hub and Vercel integration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 |
| Backend | FastAPI · Python 3.12 · httpx |
| AI Inference | Cerebras Cloud SDK · llama3.1-8b |
| Authentication | Clerk |
| Containerization | Docker · Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend + backend) |

---

## Architecture

```
Browser
  │
  ├── GET  /ideas          ──► Next.js (Vercel)
  └── POST /consultation   ──► Next.js (Vercel)
                                    │
                          NEXT_PUBLIC_API_URL
                                    │
                             FastAPI (Vercel)
                                    │
                          ┌─────────┴──────────┐
                     Clerk JWT            Cerebras API
                   (auth check)        (llama3.1-8b SSE)
                                            │
                                    Streamed Markdown
                                     back to browser
```

---

## Project Structure

```
.
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # Landing — tool selector
│   │   ├── ideas/page.tsx            # SaaS idea generator
│   │   ├── consultation/page.tsx     # Health consultation
│   │   ├── sign-in/[[...sign-in]]/   # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/   # Clerk sign-up
│   ├── Dockerfile
│   ├── vercel.json
│   └── next.config.ts
├── backend/
│   ├── main.py                       # FastAPI routes
│   ├── prompts.py                    # LLM prompt templates
│   ├── requirements.txt
│   ├── Dockerfile
│   └── vercel.json
├── docker-compose.yml
├── .github/workflows/deploy.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- [Cerebras Cloud](https://cloud.cerebras.ai) API key
- [Clerk](https://clerk.com) account

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (Full Stack)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `CEREBRAS_API_KEY` | Cerebras Cloud API key | ✅ |
| `CEREBRAS_MODEL` | Model ID (e.g. `llama3.1-8b`) | ✅ |
| `ALLOWED_ORIGINS` | Comma-separated allowed frontend URLs | ✅ |
| `CLERK_DOMAIN` | Clerk domain for JWT verification | ✅ |

### Frontend — `frontend/.env.local`

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend base URL | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in redirect path | ✅ |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up redirect path | ✅ |

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ideas` | Optional | Stream AI-generated SaaS ideas |
| `POST` | `/api/consultation` | Optional | Stream health consultation report |
| `GET` | `/health` | None | Service health check |
| `GET` | `/docs` | None | Swagger UI |

### Rate Limits

| Tier | Endpoint | Limit |
|------|----------|-------|
| Free (unauthenticated) | All | 3 requests / day |
| Pro (authenticated) | All | 20 requests / day |

### POST `/api/consultation`

```json
{
  "name": "Patient Name",
  "date": "2026-04-07",
  "complaint": "Persistent headache and mild fever for 2 days"
}
```

---

## Deployment

### Backend

```bash
cd backend
vercel link
vercel env add CEREBRAS_API_KEY production
vercel env add CEREBRAS_MODEL production
vercel env add ALLOWED_ORIGINS production
vercel env add CLERK_DOMAIN production
vercel --prod
```

### Frontend

```bash
cd frontend
vercel link
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel --prod
```

---

## CI/CD Pipeline

Every push to `main` or `master` triggers the following pipeline:

1. **Lint** — runs `ruff` on the backend and `eslint` on the frontend
2. **Build** — builds Docker images for both services
3. **Push** — pushes images to Docker Hub
4. **Deploy** — deploys both services to Vercel production

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |
| `VERCEL_TOKEN` | Vercel personal access token |

---

## Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feat/your-feature
```

3. Commit changes using [Conventional Commits](https://www.conventionalcommits.org)

```bash
git commit -m "feat: add your feature"
```

4. Push and open a Pull Request against `main`

---

## License

MIT © [Haben Eyasu](https://github.com/habeneyasu)
