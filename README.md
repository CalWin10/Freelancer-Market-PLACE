# Freelancer Marketplace

A full-stack freelancer marketplace built with Spring Boot 3.x, React.js (TypeScript), and MySQL.

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

## Local Setup

### 1. Database

Start MySQL and ensure it is running on port 3306. The database `freelancer_marketplace` will be created automatically on first boot.

### 2. Backend (Spring Boot — port 8080)

```bash
cd backend
./mvnw spring-boot:run
```

Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.username=root
spring.datasource.password=<your_password>
```

JWT and CORS are pre-configured:
```properties
jwt.secret=ChangeThisToAVeryLongSecretKeyAtLeast32CharactersLong123456789
jwt.expiration=86400000
frontend.url=http://localhost:8081
```

### 3. Frontend (React + Vite — port 8081)

```bash
cd frontend
npm install
npm run dev
```

App will be available at: http://localhost:8081

## Project Structure

```
backend/src/main/java/com/freelancer/
├── entity/        # JPA entities (User, Project, Application, Message, ...)
├── repository/    # Spring Data JPA repositories
├── service/       # Business logic
├── controller/    # REST API controllers
├── config/        # Security, CORS, OpenAPI config
├── security/      # JWT filter, UserDetailsService
└── dto/           # Request/Response DTOs

frontend/src/
├── pages/         # Route-level page components
├── components/    # Reusable UI components
├── services/      # Axios API service calls
├── routes/        # React Router route definitions
└── types/         # TypeScript type definitions
```

## Core Tables (auto-created via JPA)

| Table               | Description                  |
|---------------------|------------------------------|
| users               | Auth + role management       |
| roles               | USER / FREELANCER / CLIENT / ADMIN |
| freelancer_profiles | Freelancer details           |
| client_profiles     | Client details               |
| projects            | Project listings             |
| applications        | Freelancer applications      |
| messages            | In-app messaging             |
| notifications       | User notifications           |

## API Docs

Swagger UI available at: http://localhost:8080/swagger-ui/index.html
