# Qyroo

Qyroo frontend + Node.js backend + Firebase/Firestore database.

## Aman untuk GitHub
Jangan commit `.env`, Firebase service-account JSON, private key, atau secret lainnya.
Gunakan `backend/.env.example` sebagai template environment variable.

## Struktur
- `frontend/` — website
- `backend/` — API Node.js
- `database/` — rules dan struktur Firestore

## Deploy
Frontend dapat dideploy sebagai static site dari folder `frontend/`.
Backend harus dideploy sebagai service/server Node.js yang mendukung Express, atau disesuaikan ke serverless sebelum dipasang sebagai Vercel Function.
