# SDIT Bustanul Huda - Frontend

[![CI](https://github.com/adul11s/sdit-bustanul-huda-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/adul11s/sdit-bustanul-huda-frontend/actions/workflows/ci.yml)

## Problem

Sekolah SDIT Bustanul Huda butuh aplikasi internal untuk administrasi sekolah:
landing publik, halaman admin pengelolaan data guru/siswa, dan modul finance.
Saat ini pengelolaannya manual, dashboard ini mengonsolidasikannya dalam satu
frontend React dengan role-based akses admin/guru.

Frontend application for SDIT Bustanul Huda school management system.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router v7
- Recharts
- Tiptap (rich text editor)
- Shadcn/ui components

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── interfaces/     # TypeScript interfaces
├── lib/            # Utility functions
├── pages/          # Page components
├── services/       # API services
└── App.tsx         # Main app component
```

## Configuration

Set `VITE_API_URL` in `.env` to point to the backend API URL.
## Known gaps

- Belum ada Docker, seed data deterministik, video demo, atau live link.
- TypeScript non-strict (strict hanya TODO untuk file baru); belum ada lint config.
- Belum ada threat model, authz matrix, atau audit log; auth masih sederhana.
- Belum ada metrics/alerting/runbook; API proxy hanya untuk dev.
