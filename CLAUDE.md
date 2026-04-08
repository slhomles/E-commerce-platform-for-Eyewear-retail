# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack eyewear e-commerce platform with two sub-projects:
- `ecommerce-react/` — React frontend (Vite, Redux, Firebase auth)
- `glasses-store/` — Spring Boot backend (Java 21, MySQL, Redis)

---

## Frontend (`ecommerce-react/`)

### Commands
```sh
# Install dependencies
yarn install

# Development server (http://localhost:3001 per backend config)
yarn dev

# Production build
yarn build

# Run tests (Jest + Enzyme)
yarn test
```

### Environment Setup
Create `ecommerce-react/.env` with Firebase config vars prefixed `VITE_FIREBASE_*`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DB_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MSG_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Architecture

**State Management**: Redux with `redux-persist` (persists `auth`, `profile`, `basket`, `checkout` to localStorage) and `redux-saga` for async side effects. Store is created in `src/redux/store/store.js`.

**Routing**: React Router v5 with three route guards in `src/routers/`:
- `PublicRoute` — redirects authenticated users away (sign-in, sign-up)
- `ClientRoute` — requires authentication (account, checkout)
- `AdminRoute` — requires ADMIN role (dashboard, product/order/user management)

**Module alias**: `@/` resolves to `src/` (configured in Vite and `jsconfig.json`).

**Views** (`src/views/`): organized by domain — `auth/`, `account/`, `admin/`, `checkout/`, `home/`, `shop/`, `featured/`, `recommended/`, `search/`.

**Redux slices**: `auth`, `basket`, `cart`, `checkout`, `filter`, `misc`, `order`, `product`, `profile`, `user` — each has actions, reducer, and sagas where needed in `src/redux/`.

**Formik components** in `src/components/formik/` provide custom form inputs used throughout the app.

**To make a user ADMIN**: Register normally, then change `role` from `USER` to `ADMIN` in Firestore `users` collection.

---

## Backend (`glasses-store/`)

### Commands
```sh
# Start infrastructure (MySQL on :3307, Redis on :6379)
docker compose up -d

# Run application (Spring Boot auto-starts Docker Compose)
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build JAR
./mvnw package
```

Backend runs on `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

### Architecture

**Spring Modulith** — module-based monolith under `src/main/java/com/e_commerce/glasses_store/modules/`:
- `auth` — JWT + OAuth2 (Google/Facebook/GitHub), email verification, password reset, refresh tokens
- `admin` — product/category/inventory CRUD, user management, dashboard stats, Excel import
- `product` — catalog (Product, ProductVariant, Brand, Category, InventoryStock, ProductSpec)
- `order` — order lifecycle with status history, `OrderSpecification` for JPA filtering
- `payment` — VNPay integration
- `review` — product reviews
- `banner` — homepage banner/carousel management
- `chatbot` — (stub module)

**Security** (`src/main/java/.../security/`): `SecurityConfig` + `JwtAuthenticationFilter` + `JwtService`. OAuth2 success handler issues JWT tokens and redirects to `http://localhost:3001/oauth2/redirect`.

**Database**: MySQL 8.0 managed by Flyway migrations in `src/main/resources/db/migration/` (V1–V12). Schema never auto-updated by Hibernate (`ddl-auto=none`).

**Image uploads**: Cloudinary via `CloudinaryService` in the `admin` module.

**Common patterns**:
- `BaseEntity` provides auditing fields for all JPA entities
- `ApiResponse<T>` is the standard response wrapper
- `GlobalExceptionHandler` handles all module-specific exceptions
- Each module follows `controller → service interface → service impl` layering with DTOs separate from entities

### Key Configuration (application.properties)
- DB: `localhost:3307/glasses_store` (root/root — matches compose.yaml)
- OAuth2 redirect: `http://localhost:3001/oauth2/redirect`
- VNPay return URL: `http://localhost:3001/payment-success`
- OAuth2 client credentials (`GOOGLE_CLIENT_ID`, etc.) must be supplied as env vars
