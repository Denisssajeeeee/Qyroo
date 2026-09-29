# Struktur Data Qyroo

## users/{uid}
uid, email, name, role, tier, balance, status, createdAt, updatedAt

## products/{productId}
name, description, category, price, originalPrice, discount, icon/image, active, sortOrder, createdAt, updatedAt

## favorites/{uid}/products/{productId}
productId, createdAt

## topups/{topupId}
uid, amount, method, proof, status, createdAt, reviewedAt, reviewer

## settings/general
maintenance, announcement
