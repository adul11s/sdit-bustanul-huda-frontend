# Quality Scorecard — sdit-bustanul-huda-frontend

| Dimensi | Bobot | Skor | Bukti |
|---|---|---|---|
| Narasi masalah | 10% | 8 | README#problem — target pengguna jelas (admin guru/ortu SDIT), tapi tanpa case study pengguna nyata |
| Demo & reproduksibilitas | 15% | 9 | **Live: https://sdit-bustanul-huda-frontend.vercel.app** (HTTP 200, terverifikasi 2026-10-25); `npm install && npm run dev` jalan; backend belum dideploy (dinyatakan jujur di README#demo). Belum ada Docker atau seed deterministik |
| Kebenaran & test | 20% | 9 | **CI hijau terverifikasi**: workflow `CI` run [40163301933](https://github.com/adul11s/sdit-bustanul-huda-frontend/actions/runs/40163301933) = success pada commit `dd7a478`; 30/30 test hijau (8 file, vitest + testing-library) saat commit ini; TS masih non-strict (strict hanya TODO untuk file baru) |
| Arsitektur & keputusan | 15% | 7 | Struktur jelas (landing/ admin/ finance/, services, hooks); belum ada ADR/ERD tertulis di repo ini |
| Keamanan | 10% | 6 | Auth via `src/lib/auth-context`; belum ada threat model, authz matrix, atau audit log |
| Operasional | 10% | 6 | Belum ada metrics/alert/runbook; proxy dev-only |
| Kerapian kode | 10% | 7 | `tsc --noEmit` exit 0; TS non-strict (strict hanya TODO untuk file baru), tanpa lint config |
| Presentasi | 10% | 7 | README punya bagian Demo + badge CI dan menyatakan gap apa adanya; belum ada video/GIF atau above-the-fold polish |

**Total:** 7.5 (dari 6.8)
**Riwayat:** 6.8 (2026-10-25, sebelum live link + CI) → 7.5 (2026-10-25, live demo 9, CI terverifikasi 9, presentasi 7).
**Kenapa bukan lebih tinggi:** kebenaran tidak dinaikkan ke 10 karena TS masih non-strict dan belum ada lint; demo tidak 10 karena belum ada video dan backend belum live.
**Target berikutnya:** video demo 60–90 detik + GIF di README → presentasi 9, demo 10 → total ±8.2. Lalu aktifkan `strict` per-file dan tambah lint config → kerapian 8 → total ±8.3.
**Tanggal review:** 2026-10-25
