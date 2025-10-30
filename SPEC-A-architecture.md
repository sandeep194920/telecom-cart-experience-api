# SPEC-A: Telecom Shopping Cart Experience API – Architecture & Abstractions

## Folder Structure

```bash
src/
├── controllers/          # HTTP request/response handling
│   └── CartController.ts
├── services/            # Business logic
│   └── CartService.ts
├── clients/             # External integrations
│   └── SalesforceCartClient.ts
├── models/              # Domain types & interfaces
│   ├── Cart.ts
│   ├── CartItem.ts
│   └── CheckoutResult.ts
├── middleware/          # Express middleware
│   ├── ErrorHandler.ts
│   └── ValidateRequest.ts
├── validators/          # Request validation schemas
│   └── CartValidators.ts
├── utils/               # Shared utilities
│   └── logger.ts
├── types/               # TypeScript type definitions
│   └── express.d.ts
├── routes.ts            # Route definitions
├── app.ts               # Express app setup
└── server.ts            # Server entry point

tests/
├── unit/
│   ├── controllers/
│   ├── services/
│   └── clients/
└── integration/
```

---

## Architecture Layers & Reasoning

### 1. Controllers Layer (HTTP Boundary)

**Purpose:** Handle HTTP concerns only — parse requests, call services, format responses.

**Reasoning:**

- Keep controllers thin, delegate business logic to services
- Easy to swap HTTP frameworks or add GraphQL later
- Allows testing services without HTTP mocking

### 2. Services Layer (Business Logic)

**Purpose:** Orchestrate business workflows, enforce business rules, coordinate between clients.

**Reasoning:**

- Single responsibility: each service handles one domain concept
- Pure business logic, independent of HTTP or external clients
- Easy to unit test with mocked dependencies
- Centralizes business rules for reuse

### 3. Clients Layer (External Integration)

**Purpose:** Encapsulate communication with external systems (Salesforce in this case).

**Reasoning:**

- Isolate external API changes
- Easy to mock in tests
- Simulates context expiry / ephemeral cart
- Can extend with caching, retries, etc.

### 4. Models Layer (Domain Types)

**Purpose:** Define domain objects and interfaces.

**Reasoning:**

- Type safety across layers
- Single source of truth for data structures
- Represents domain-driven design concepts

### 5. Validators Layer (Input Validation)

**Purpose:** Validate and sanitize incoming requests.

**Reasoning:**

- Fail fast on invalid input
- Reusable validation logic
- Type-safe request bodies

### 6. Middleware Layer

**Purpose:** Cross-cutting concerns (error handling, logging, validation)

**Reasoning:**

- Keeps controllers clean
- Centralizes shared logic
- Ensures consistent API responses

## Design Patterns Applied

- **Dependency Injection:** Controllers and services receive dependencies via constructor for easy mocking and loose coupling
- **Repository Pattern (via Client):** SalesforceCartClient acts as repository abstraction
- **Service Layer Pattern:** Isolate business logic from infrastructure
- **Factory Pattern (Errors):** Custom error classes with consistent creation
- **Middleware Chain (Express):** Pipeline of request processors
- **Singleton** – `SalesforceClient` is a single shared instance across the app.

## Data Flow

```scss
HTTP Request
    ↓
Routes (routes.ts)
    ↓
Middleware (validation, logging)
    ↓
Controller (parse request, delegate to service)
    ↓
Service (business logic, orchestration)
    ↓
Client (SalesforceCartClient)
    ↓
Service (transform/enrich response)
    ↓
Controller (format HTTP response)
    ↓
Middleware (error handling)
    ↓
HTTP Response
```

## Testing Strategy

- **Unit Tests:** Services, controllers, clients tested in isolation
- **Integration Tests:** End-to-end flows (create cart, add/remove items, checkout)
- Use mocks for SalesforceCartClient to simulate ephemeral behavior

## Key Benefits

- Testable: Each layer isolated, minimal mocking required
- Maintainable: Changes localized to layers
- Scalable: Easy to add new features (webhooks, events, caching)
- Type-safe: TypeScript ensures contract compliance
- Flexible: Swap implementations without affecting other layers
