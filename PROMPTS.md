# PROMPTS.md

[Full chat reference](https://claude.ai/share/456ff94e-4d2a-42d0-a121-0477eac14bc7)

## Prompt 1

**Message to Claude:**

> I’m building a thin Experience API in Node.js + TypeScript that powers a telecom shopping cart.  
> Constraints:
>
> - No database; cart context is ephemeral
> - Simulate SalesforceCartClient with TTL-based expiry
> - Endpoints: create cart, get cart, add/remove items, checkout
>
> Based on the architecture below (SPEC-A), generate SPEC-B with folder structure, key abstractions, and endpoint design.
>
> Paste of SPEC-A:  
> [Architecture Layers & Reasoning from SPEC-A.md]

**Claude’s Response:**

- Generated a high-level implementation spec (SPEC-B)
- Proposed Express-based structure with layered separation:
  - Controllers, Services, Clients, Models, Validators, Middleware
- Simulated `SalesforceCartClient` using in-memory TTL-based storage
- Suggested endpoints for `createCart`, `getCart`, `addItem`, `removeItem`, and `checkout`
- Designed with flexibility for future GraphQL support and testing ease

**Notes:**

- Accepted Express setup and layer separation as proposed
- Planned to validate all requests via Zod
- Intend to revisit cart persistence later if a database is introduced

---

## Prompt 2

**Message to Claude:**

> Why is `customerId` optional in `POST /api/v1/carts`?

**Claude’s Response:**

- **Guest Checkout Flow:** Allows anonymous users to browse and build a cart before logging in.
- **Authenticated Flow:** Users can attach their `customerId` immediately.
- Recommended keeping it optional at cart creation but required at checkout.
- Provided telecom-specific reasoning:
  - Optional makes sense for browsing accessories/devices.
  - Required at checkout or for adding plan-type products.

**Key Excerpt:**

> “If telecom plans always need identity verification, I'd recommend making `customerId` required at cart creation to fail fast and simplify the flow.”

**My Reply:**

> “Yeah sounds good, let's keep it as is.”

**Claude’s Summary of Decision:**

- Keep `customerId` optional at cart creation
- Required at checkout
- Supports guest and authenticated workflows
- Enables smooth cart migration from anonymous → authenticated user

**Notes:**

- Accepted the flexibility for guest flows
- Will enforce `customerId` in `CartService` for certain plan products if needed later

---

## Prompt 3

**Message to Claude:**

> In `CartService` we currently have a direct dependency on `SalesforceCartClient`.  
> Do you think it’s better to have an interface rather than the client itself, so that `SFClient` can implement that interface and we can swap implementations in the future?

**Claude’s Response:**

- **Recommendation:** Yes, introducing an interface is a solid architectural improvement.
- **Reasoning:**
  - Direct dependency leads to tight coupling.
  - Harder to unit test; must mock the entire concrete client.
  - Violates Dependency Inversion Principle (DIP).
  - Not extensible if you want to swap to other implementations (Redis, real Salesforce API, etc.).
- **Solution:** Create an `ICartRepository` interface that defines all cart operations (`createCart`, `getCart`, `addItem`, `removeItem`, `updateCart`, `deleteCart`).
- **Updated `CartService`:** Accepts `ICartRepository` instead of concrete `SalesforceCartClient`.
- **Benefits:**
  - Loose coupling between service and client.
  - Easy unit testing with mocks.
  - Swappable implementations without changing `CartService`.
  - Aligns with SOLID principles.
- **Additional Notes:**
  - Existing `SalesforceCartClient` can implement `ICartRepository`.
  - Enables alternative implementations (e.g., in-memory for testing, Redis-backed, or real Salesforce API).

**My Reply / Decision:**

> “Perfect — we’ll introduce `ICartRepository` and have `CartService` depend on it. `SalesforceCartClient` will implement this interface.”

**Notes:**

- Added interface layer to follow DIP and improve maintainability.
- Makes unit testing straightforward.
- Future-proof for multiple implementations of the cart repository.

---

## Prompt 4

**Message to Claude:**

> In `CartService`, we currently have both `removeItem()` and `updateCart()`.  
> Do you think it’s better to keep both, or just have one method for updates?

**Claude’s Response:**

- Explained the tradeoffs between _command-based APIs_ (explicit methods like `removeItem`) and _state-based APIs_ (single `updateCart`).
- Recommended keeping **both** for now:
  - `removeItem(cartId, itemId)` → explicit, intent-revealing action
  - `updateCart(cartId, updates)` → flexible for metadata, promo codes, or customer association
- Suggested adding **validation guardrails** inside `CartService` to prevent misuse of `updateCart` (e.g., disallow directly updating `items` or computed totals).
- Emphasized that specific operations like `updateItemQuantity()` can be added later as patterns emerge.

**Example Guardrails:**

```ts
if ("items" in updates) {
  throw new ValidationError(
    "Cannot update items directly. Use addItem() or removeItem() instead."
  );
}
if ("total" in updates || "subtotal" in updates) {
  throw new ValidationError("Cannot update calculated fields.");
}
```

**Notes:**

✅ Keep both methods:

- `removeItem()` = explicit item removal
- `updateCart()` = safe, flexible metadata updates

✅ Add guardrails in CartService to prevent misuse

✅ Evolve later into more specific methods (e.g., updateItemQuantity) if needed

**My Reply / Decision:**

> Agreed with Claude’s recommendation — I’ll keep both methods for now.
> Will enforce validation in the service layer to prevent updating cart items or totals directly.
