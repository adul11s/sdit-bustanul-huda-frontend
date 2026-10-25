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

## Demo

Frontend production: **https://sdit-bustanul-huda-frontend.vercel.app** (deploy OTA via `vercel deploy --prod`, project `adul11s-projects/sdit-bustanul-huda-frontend`).

Backend: **TODO: deploy menunggu hosting — CI bukti test** (lihat [README backend](https://github.com/adul11s/sdit-bustanul-huda-backend#deployment--demo): CI hijau, 28/28 test; deploy asli menunggu database Postgres tersedia publik).

### Video demo (halaman publik)

![Demo landing SDIT Bustanul Huda](docs/media/demo.gif)

Rekaman 35 detik dari deployment live: hero carousel → about → program → galeri → pengumuman → kontak → halaman login. Versi penuh: [`docs/media/demo.mp4`](docs/media/demo.mp4) (1 MB). Direkam otomatis dengan `node scripts/demo-video.mjs` (Playwright, butuh `@playwright/test`).

**Catatan jujur:** video ini **hanya halaman publik**. Panel admin belum bisa didemokan karena backend belum dideploy (butuh Postgres publik) — jadi tidak ada kredensial demo yang bisa dibagikan ke reviewer. Itu gap terbesar repo ini setelah live link.

Deep link SPA sudah diperbaiki (`vercel.json` rewrite ke `index.html`): `/login` dan `/admin` sekarang 200, sebelumnya 404 di deployment.

## Configuration

Set `VITE_API_URL` in `.env` to point to the backend API URL.
## Known gaps

- Belum ada Docker atau seed data deterministik; video demo yang ada baru mencakup halaman publik (panel admin butuh backend live).
- TypeScript `strict: true` (0 error) dan ESLint flat config aktif; `npm run lint` = `eslint . && tsc --noEmit`, dijalankan di CI. Sisa 65 warning `@typescript-eslint/no-explicit-any` yang masih di-track (belum dijadikan error).
- Belum ada threat model, authz matrix, atau audit log; auth masih sederhana.
- Belum ada metrics/alerting/runbook; API proxy hanya untuk dev.
