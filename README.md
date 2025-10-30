# Telecom Cart API

## Overview

Thin Experience API for a telecom shopping cart. No database; carts are ephemeral and stored in-memory with TTL. Simulated SalesforceCartClient.

## Setup

```bash
git clone https://github.com/sandeep194920/telecom-cart-experience-api.git
cd telecom-cart-experience-api
npm install
```

## Run

```bash
npm run dev
```

## Test

```bash
npm run test
```

## API Testing

You can import the `docs/Telecom API.postman_collection.json` into Postman to test all endpoints.

- Base URL: `http://localhost:3000/api/v1`
- Includes endpoints for:
  - Creating/fetching cart
  - Adding/removing items
  - Checking out cart
  - Updating/removing cart

## Endpoints

- POST /api/v1/carts – create cart
- GET /api/v1/carts/:cartId – fetch cart
- POST /api/v1/carts/:cartId/items – add item
- DELETE /api/v1/carts/:cartId/items/:itemId – remove item
- PATCH /api/v1/carts/:cartId – update cart
- POST /api/v1/carts/:cartId/checkout – checkout cart
- DELETE /api/v1/carts/:cartId – delete cart

## Decisions & Tradeoffs

- In-memory store only (no DB)
- TTL-based cart expiry
- Basic validation via Zod
- Controller thin, service orchestrates rules
- AppError standardizes error responses

## Known Gaps

- Checkout is simulated
- Inventory, promo codes, payment handling are placeholders
- Authentication skipped - simulating customer id
- Product metadata is simplified
