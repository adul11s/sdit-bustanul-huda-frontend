# Quality Scorecard — sdit-bustanul-huda-frontend

| Dimensi | Bobot | Skor | Bukti |
|---|---|---|---|
| Narasi masalah | 10% | 8 | README#problem — target pengguna jelas (admin guru/ortu SDIT), tapi tanpa case study pengguna nyata |
| Demo & reproduksibilitas | 15% | 9 | **Live: https://sdit-bustanul-huda-frontend.vercel.app** (HTTP 200, terverifikasi 2026-10-25); `npm install && npm run dev` jalan; backend belum dideploy (dinyatakan jujur di README#demo). Belum ada Docker atau seed deterministik |
| Kebenaran & test | 20% | 10 | 30/30 test hijau (8 file, vitest + testing-library). CI menjalankan `npm run lint` (eslint + `tsc --noEmit` strict) → `npm test` → `npm run build`, hijau di setiap push `main` |
| Arsitektur & keputusan | 15% | 7 | Struktur jelas (landing/ admin/ finance/, services, hooks); belum ada ADR/ERD tertulis di repo ini |
| Keamanan | 10% | 6 | Auth via `src/lib/auth-context`; belum ada threat model, authz matrix, atau audit log |
| Operasional | 10% | 6 | Belum ada metrics/alert/runbook; proxy dev-only |
| Kerapian kode | 10% | 9 | **`strict: true` aktif, `tsc --noEmit` 0 error**; **ESLint 9 flat config** (`eslint.config.js`: typescript-eslint recommended + react-hooks + react-refresh + unused-imports) → **0 error**, 65 warning `no-explicit-any` yang di-track. Bukan 10 karena `any` warisan belum dibereskan |
| Presentasi | 10% | 7 | README punya bagian Demo + badge CI dan menyatakan gap apa adanya; belum ada video/GIF atau above-the-fold polish |

**Total:** 8.0 (dari 6.8)
**Riwayat:** 6.8 (2026-10-25, sebelum live link + CI) → 7.5 (live demo 9, CI terverifikasi 9, presentasi 7) → 8.0 (strict TS + ESLint di CI: kebenaran 10, kerapian 9).
**Kenapa belum lebih tinggi:** demo tidak 10 karena belum ada video dan backend belum live; kerapian tidak 10 karena masih ada 65 warning `any`.
**Target berikutnya:** video demo 60–90 detik + GIF di README → presentasi 9 → total ±8.2. Lalu bereskan 65 warning `any` → kerapian 10 → total ±8.3.
**Tanggal review:** 2026-10-25
