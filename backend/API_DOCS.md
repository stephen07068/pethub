# PetStore Hub — API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** Admin routes require `Authorization: Bearer <token>` header.  
**Cart Routes:** Require `X-Cart-Token: <token>` header.

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | API health check |

**Response:**
```json
{ "status": "ok", "service": "PetStore Hub API", "phase": "2B" }
```

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | None | Admin login — returns JWT |

**Request body:** `{ "email": "admin@petstorehub.com", "password": "Admin@1234" }`  
**Response:** `{ "success": true, "data": { "token": "eyJ...", "admin": {...} } }`

---

## Products (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products/` | None | List all active products |
| GET | `/products/{id}` | None | Get single product by ID |
| GET | `/products/slug/{slug}` | None | Get product by slug |
| GET | `/products/featured` | None | Featured products |
| GET | `/products/new-arrivals` | None | Newest products |
| GET | `/products/search` | None | Search products |
| GET | `/products/category/{slug}` | None | Products by category slug |

**Query params (GET /products/):**
- `page`, `per_page` — pagination
- `category_id` — filter by category
- `q` — keyword search
- `sort` — `newest | oldest | price_asc | price_desc | featured | popularity`
- `min_price`, `max_price` — price range
- `in_stock=true` — only in-stock

---

## Products (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/products/` | JWT | List all products (any status) |
| POST | `/admin/products/` | JWT | Create product |
| PUT | `/admin/products/{id}` | JWT | Update product |
| DELETE | `/admin/products/{id}` | JWT | Delete product |
| PATCH | `/admin/products/{id}/stock` | JWT | Update stock |
| PATCH | `/admin/products/{id}/feature` | JWT | Toggle featured |
| POST | `/admin/products/{id}/images` | JWT | Upload image (multipart) |
| DELETE | `/admin/products/{id}/images/{img_id}` | JWT | Delete image |

**Create/Update body:**
```json
{
  "name": "Premium Dog Food",
  "category_id": 1,
  "price": 29.99,
  "stock": 50,
  "short_description": "...",
  "description": "...",
  "sku": "PDF-001",
  "featured": true,
  "status": "active"
}
```

---

## Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories/` | None | List all categories |
| GET | `/categories/{id}` | None | Get single category |
| POST | `/categories/` | JWT | Create category |
| PUT | `/categories/{id}` | JWT | Update category |
| DELETE | `/categories/{id}` | JWT | Delete category |

---

## Cart (Guest)

All cart routes require `X-Cart-Token` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/cart/` | None | Create new cart → returns `cart_token` |
| GET | `/cart/` | Token | View cart with totals |
| DELETE | `/cart/` | Token | Clear cart |
| POST | `/cart/items` | Token | Add item |
| PATCH | `/cart/items/{product_id}` | Token | Update quantity |
| DELETE | `/cart/items/{product_id}` | Token | Remove item |

**Add item body:** `{ "product_id": 1, "quantity": 2 }`

**Cart response includes:**
```json
{
  "items": [...],
  "subtotal": 59.98,
  "shipping_fee": 20.00,
  "grand_total": 79.98
}
```

---

## Checkout (Guest)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/checkout/place-order` | None | Place order from cart |
| GET | `/checkout/order/{order_number}` | None | Get order by number |

**Place order body:**
```json
{
  "cart_token": "abc123",
  "address": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "country": "US",
    "state": "CA",
    "city": "Los Angeles",
    "street_address": "123 Main St",
    "apartment": "Apt 4B",
    "postal_code": "90001",
    "delivery_notes": "Leave at door"
  },
  "payment_method": "btc",
  "payment_reference": "txhash123",
  "currency": "BTC"
}
```

**Supported payment methods:** `btc | eth | usdt_trc20 | usdt_bep20 | sol | apple_pay | google_pay | gift_card`

---

## Wallets (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wallets/{coin}` | None | Get wallet address for coin |
| GET | `/wallets/{coin}/qr` | None | Get QR code URL for coin |

**Supported coins:** `btc | eth | usdt_trc20 | usdt_bep20 | sol`

---

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/submit-tx` | None | Submit transaction hash for crypto |
| POST | `/payments/gift-card` | None | Submit gift card image |

---

## Store Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings/` | None | Get store settings |
| PUT | `/settings/` | JWT | Update settings |

**Settings fields:** `store_name`, `shipping_fee`, `support_email`, `support_phone`, `business_address`, `currency`, `low_stock_threshold`

---

## Admin Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | JWT | Full dashboard summary |

**Response includes:**
```json
{
  "totals": { "orders": 50, "sales": 1250.00, "products": 24, "categories": 8, "revenue": 1250.00 },
  "order_status_counts": { "pending": 5, "processing": 10, "shipped": 8, "delivered": 25, "cancelled": 2 },
  "low_stock_count": 3,
  "recent_orders": [...],
  "recent_payments": [...]
}
```

---

## Admin Analytics

| Method | Endpoint | Auth | Query Params | Description |
|--------|----------|------|--------------|-------------|
| GET | `/admin/analytics/sales` | JWT | `days=30` | Daily sales chart |
| GET | `/admin/analytics/sales/weekly` | JWT | `weeks=12` | Weekly sales chart |
| GET | `/admin/analytics/sales/monthly` | JWT | `months=12` | Monthly sales chart |
| GET | `/admin/analytics/sales/yearly` | JWT | — | All-time yearly sales |
| GET | `/admin/analytics/best-sellers` | JWT | `limit=5` | Top products by units sold |
| GET | `/admin/analytics/popular-categories` | JWT | `limit=5` | Most popular categories |
| GET | `/admin/analytics/revenue-by-category` | JWT | — | Revenue per category |
| GET | `/admin/analytics/revenue-by-month` | JWT | `months=12` | Revenue chart by month |
| GET | `/admin/analytics/payment-methods` | JWT | — | Payment method distribution |
| GET | `/admin/analytics/aov` | JWT | `days=30` | Average Order Value |

**Chart data format:** `[{ "date": "2026-07-01", "sales": 125.00 }, ...]`

---

## Admin Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/orders/` | JWT | List all orders |
| GET | `/admin/orders/{order_number}` | JWT | Get order with full detail |
| PATCH | `/admin/orders/{order_id}/status` | JWT | Update order status |
| GET | `/admin/orders/gift-cards` | JWT | List gift card submissions |
| PATCH | `/admin/orders/gift-cards/{id}/review` | JWT | Approve/reject gift card |

**Order list query params:**
- `q` — search by order number, customer name, or email
- `status` — `pending | processing | shipped | delivered | cancelled`
- `payment_method` — `btc | eth | usdt_trc20 | usdt_bep20 | sol | apple_pay | google_pay | gift_card`
- `payment_status` — `pending | paid | failed | refunded`
- `date_from`, `date_to` — ISO 8601 date range
- `sort` — `date_desc | date_asc | amount_desc | amount_asc`
- `page`, `per_page` — pagination

**Update status body:** `{ "status": "shipped" }`  
**Valid statuses:** `pending | paid | processing | shipped | delivered | cancelled`

---

## Error Response Format

All errors return:
```json
{ "success": false, "message": "Human-readable error message" }
```

**Status codes:**
- `400` Bad Request
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden
- `404` Not Found
- `422` Validation Error
- `429` Rate Limit Exceeded
- `500` Internal Server Error
