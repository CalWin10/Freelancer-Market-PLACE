# Exertio — Full-Stack Freelancer Marketplace

A modern, high-performance freelance services marketplace platform built with **Spring Boot 3 (Java 17)**, **React 19 (TypeScript + Vite)**, and **MySQL**. Inspired by premium marketplace designs with rich animations, real-time status management, and clean user experience.

---

## ✨ Features

### 🌟 Landing Page (Exertio Aesthetic)
- **Hero Showcase**: Smart search bar with category selectors, trending keyword tags (*React Native*, *Flutter*, *UI/UX*, *SEO*), and interactive demo tour modal.
- **Top Services Grid**: 4x2 interactive service cards with order queues, star ratings, starting prices, and favorite toggles.
- **Cosmic Gradient CTA**: High-impact promotional banner with quick action triggers.
- **Platform Highlights & Statistics**: Real-time platform counters (*5,000+ total sales*, *4,507+ client reviews*, *10,000+ users*).

### 💼 SaaS Freelancers & Project Dashboard
- **Top Exertio Navigation**: Persistent navbar with role-aware actions (*Dashboard*, *Browse Projects*, *Find Freelancers*, *My Projects*, *Profile/Settings*, and *Sign Out*).
- **Inline Filter Controls**: Real-time filtering by *Skills*, *Location*, and *Hourly rate*.
- **Freelancer Directory**: 3-Column responsive card grid displaying availability badges (`AVAILABLE` / `NOT AVAILABLE`), focus area tags, completed project counts, and **`Invite for Job`** modal triggers.
- **Client & Freelancer Roles**:
  - **Clients**: Create, edit, and manage projects, review applicant proposals, assign freelancers, and release milestone status.
  - **Freelancers**: Search open projects, apply with proposals, track submissions, and chat directly with clients.

### 🛡️ Security & Real-Time Messaging
- Stateless JWT authentication with role-based access control (`CLIENT`, `FREELANCER`, `ADMIN`).
- In-app direct messaging between clients and freelancers on active projects.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Vanilla CSS Design System, Google Fonts (Outfit, Plus Jakarta Sans, Inter) |
| **Backend** | Spring Boot 3.x, Java 17, Spring Security (JWT), Spring Data JPA, Hibernate, OpenAPI (Swagger) |
| **Database** | MySQL 8.x |
| **Tooling** | Maven, npm, Git |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 17+**
- **Node.js 20+** or **22+**
- **MySQL 8+**
- **Maven 3.8+**

---

### 1. Database Configuration
Start your MySQL server on port `3306`. The schema `freelancer_marketplace` will be created automatically on first backend run.

---

### 2. Backend Setup (Spring Boot)

```bash
cd backend

# Configure database credentials in src/main/resources/application.properties if needed
# spring.datasource.username=root
# spring.datasource.password=your_password

# Run Spring Boot backend (runs on http://localhost:8080)
./mvnw spring-boot:run
```

- **Swagger API Docs**: `http://localhost:8080/swagger-ui/index.html`

---

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:8081)
npm run dev
```

- Open **`http://localhost:8081`** in your browser to explore the marketplace.

---

## 📁 Repository Structure

```
.
├── backend/
│   └── src/main/java/com/freelancer/
│       ├── controller/       # REST Controllers (Auth, Projects, Freelancers, Messages, Profiles)
│       ├── service/          # Business logic & state machine
│       ├── repository/       # Spring Data JPA repositories
│       ├── entity/           # JPA entities (User, Project, Application, Message, Profile)
│       ├── security/         # JWT filters & authentication entry points
│       └── dto/              # Request & response data transfer objects
│
├── frontend/
│   ├── public/               # Static assets & illustrations
│   └── src/
│       ├── components/       # Cards, Common UI, Layouts (Header, Footer, AppShell), Forms, Modals
│       ├── pages/            # LandingPage, Dashboard, ProjectSearch, FreelancerSearch, Messages, Profile
│       ├── services/         # Axios API services
│       ├── routes/           # Protected, Role, and Public route guards
│       ├── context/          # Authentication context
│       └── index.css         # Exertio Design System & CSS variables
│
└── README.md
```

---

## 📜 Core API Endpoints

- `POST /api/auth/register` — Register a new client or freelancer
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/projects` — Search and filter active projects
- `POST /api/projects` — Create a new project (*Client only*)
- `GET /api/freelancers/search` — Search talent directory by skills and location
- `POST /api/applications` — Submit a project proposal (*Freelancer only*)
- `GET /api/messages/project/{id}` — Retrieve project message history
- `POST /api/messages` — Send direct project message

---

## 📄 License
This project is licensed under the MIT License.
