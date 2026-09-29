# Qyroo Backend v2

Node.js + Express + Firebase Admin SDK. Backend menjadi sumber data utama untuk user, role, produk, favorit, top up, saldo, settings, dan downloader proxy.

## Environment
Salin `.env.example` menjadi `.env` dan isi Service Account Firebase. `ADMIN_UID` opsional; jika kosong backend memakai `ADMIN_EMAIL`.

## Collections Firestore
- `users/{uid}`: email, role, active, balance, timestamps
- `users/{uid}/favorites/{productId}`: favorit produk
- `products/{id}`: nama, harga, kategori, deskripsi, promo, active
- `topups/{id}`: pengajuan top up + bukti
- `balances/{uid}`: saldo user
- `transactions/{id}`: riwayat perubahan saldo
- `settings/site`: pengumuman + maintenance

Produk contoh dibuat otomatis ketika collection `products` masih kosong.
