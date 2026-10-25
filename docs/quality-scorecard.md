# Quality Scorecard — sdit-bustanul-huda-frontend

| Dimensi | Bobot | Skor | Bukti |
|---|---|---|---|
| Narasi masalah | 10% | 8 | README#problem — target pengguna jelas (admin guru/ortu SDIT), tapi tanpa case study pengguna nyata |
| Demo & reproduksibilitas | 15% | 7 | `npm install && npm run dev` jalan; belum ada Docker, seed deterministik, video, atau live link |
| Kebenaran & test | 20% | 7 | Vitest + testing-library, 31 test hijau saat commit ini; non-strict TS; belum ada CI test workflow terverifikasi |
| Arsitektur & keputusan | 15% | 7 | Struktur jelas (landing/ admin/ finance/, services, hooks); belum ada ADR/ERD tertulis |
| Keamanan | 10% | 6 | Auth via `src/lib/auth-context`; belum ada threat model, authz matrix, atau audit log |
| Operasional | 10% | 6 | Belum ada metrics/alert/runbook; proxy dev-only |
| Kerapian kode | 10% | 7 | `tsc --noEmit` exit 0; TS non-strict (strict hanya TODO untuk file baru), tanpa lint config |
| Presentasi | 10% | 6 | README ada; belum ada video, GIF, atau above-the-fold polish |

**Total:** 6.6
**Target berikutnya:** tambahkan CI workflow (test + build) dan aktifkan `strict` per-file (file baru) → naik kerapian ke 8 disertai test otentikasi/validasi.
**Tanggal review:** 2026-10-25
