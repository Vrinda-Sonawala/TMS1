# Aegis Capital Banking Transaction Management System

Enterprise-grade banking transaction management platform with ACID-compliant operations, JWT security, and a premium Angular dashboard.

## Architecture

```
├── backend/          Spring Boot 3.x (Java 17) REST API
├── frontend/         Angular 17 SPA
├── database/         MySQL 9 schema
├── docker-compose.yml
└── postman/          API collection
```

**Layered Backend Structure:** `controller → service → repository → entity`

**Concurrency Strategy:** Pessimistic row-level locking (`SELECT FOR UPDATE`) combined with `@Version` optimistic locking and `REPEATABLE_READ` isolation for atomic transfers with automatic rollback on failure.

## Core Modules

| Module | Description |
|--------|-------------|
| Authentication | JWT register/login, BCrypt passwords |
| User Management | Customer & Admin roles |
| Account Management | 5 account types with type-specific rules |
| Deposit / Withdraw / Transfer | ACID-compliant transactions |
| Transaction History | Persistent MySQL storage |
| Beneficiary Management | Saved transfer recipients |
| Admin Monitoring | System-wide user & transaction view |

## Account Types

- **SAVINGS** — Minimum balance, daily withdrawal limit, interest
- **CURRENT** — Overdraft support, no withdrawal limit
- **BUSINESS** — High daily transaction limit
- **SALARY** — Zero minimum balance
- **FIXED_DEPOSIT** — Locked period, no normal withdrawal

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- MySQL 9 (or Docker)

## Quick Start (Docker)

```bash
docker-compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| MySQL | localhost:3306 |

**Default Admin:** `admin@aegiscapital.com` / `Admin@123`

## Manual Setup

### Database

```bash
mysql -u root -p < database/schema.sql
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

Environment variables (optional):

| Variable | Default |
|----------|---------|
| DB_HOST | localhost |
| DB_PORT | 3306 |
| DB_NAME | aegis_banking |
| DB_USERNAME | root |
| DB_PASSWORD | root |
| JWT_SECRET | (see application.yml) |
| SERVER_PORT | 8080 |

### Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:4200

## API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Accounts
- `POST /api/v1/accounts/create`
- `GET /api/v1/accounts/{accountNumber}`
- `GET /api/v1/accounts/balance/{accountNumber}`
- `GET /api/v1/accounts/user/{userId}`

### Transactions
- `POST /api/v1/transactions/deposit`
- `POST /api/v1/transactions/withdraw`
- `POST /api/v1/transactions/transfer`
- `GET /api/v1/transactions/history/{accountNumber}`

### Admin
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/transactions`

## Testing

```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm test
```

## Security

- Stateless JWT authentication
- BCrypt (strength 12) password hashing
- Role-based access control (CUSTOMER / ADMIN)
- CORS configured for Angular dev server
- Input validation on all DTOs

## Transaction Integrity

All financial operations use `@Transactional(isolation = REPEATABLE_READ, rollbackFor = Exception.class)` with pessimistic account locking to guarantee:

1. **Atomicity** — Full rollback if credit fails after debit
2. **Consistency** — Balance rules enforced per account type
3. **Isolation** — No dirty reads or lost updates
4. **Durability** — All transactions persisted to MySQL

## License

Proprietary — Aegis Capital Bank
