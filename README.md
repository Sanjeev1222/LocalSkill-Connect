<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-Academic-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Year-2026-purple?style=for-the-badge" />
</p>

# 🛠️ LocalSkill Connect

> **A full-stack hyperlocal service marketplace that bridges the gap between skilled technicians and customers, featuring real-time video consulting, AI-powered cost estimation, and an integrated tool rental ecosystem.**

Built from scratch as a **Major Project** by B.Tech CSE (AI & ML) students at **Buddha Institute of Technology, Gorakhpur**.

---

## 📌 Problem Statement

In India, finding a reliable local technician (electrician, plumber, carpenter, etc.) is a frustrating experience. Customers have no visibility into pricing, no way to verify skills, and no structured communication channel before hiring. Meanwhile, skilled technicians struggle to find consistent work and build an online reputation. Existing platforms like UrbanClap/Urban Company charge heavy commissions and don't operate in smaller cities.

**LocalSkill Connect** solves this by creating a transparent, commission-free platform where:
- Customers can **search, compare, video-consult, and book** technicians with full price visibility
- Technicians can **manage their schedule, provide cost estimates, and build their reputation** through verified reviews
- Tool owners can **rent out equipment** to both technicians and customers
- Admins can **oversee the entire ecosystem** from a single dashboard

---

## 🏆 Project Originality & Innovation

> **This project is built entirely from scratch — no templates, no clones, no copied tutorials.** Every line of code, every design decision, and every feature workflow was conceptualized, architected, and implemented by our team.

**What makes LocalSkill Connect genuinely original:**

- **Real-Time WebRTC Video Consulting Before Booking** — Unlike any existing service marketplace (UrbanClap, JustDial, Sulekha), we let customers video-call a technician *before* committing to a booking. The entire signaling layer (offer/answer/ICE via Socket.IO), peer-to-peer media streams, incoming call notifications across pages, and call UI with PiP self-view were hand-built — not a third-party embed or iframe widget.

- **Photo/Video-Based Cost Estimation with Itemized Breakdown** — No existing platform offers a workflow where a user uploads photos/videos of their issue, a technician responds with an itemized material + labour cost breakdown (with quantities, unit prices, and totals), and the user can accept to auto-generate a booking. This feature bridges the trust gap that plagues the unorganized service sector in India.

- **Unified Service + Tool Rental Marketplace** — We combined technician booking and equipment rental into a single ecosystem. In the real world, a customer hiring a carpenter may also need to rent a power drill. No student project or existing Indian platform unifies these two flows.

- **Four Purpose-Built Dashboards** — Each role (User, Technician, Tool Owner, Admin) has a completely different dashboard with role-specific analytics, workflows, and controls — not just toggled visibility on shared components.

- **Production-Level Security & Architecture** — JWT auth across both REST and WebSocket, role-based middleware, rate limiting, Helmet.js headers, file upload validation, bcrypt hashing — this project follows real-world security practices, not just CRUD operations.

- **Hyperlocal Indian Context** — Designed around actual pain points of hiring technicians in tier-2/tier-3 Indian cities: no price transparency, no skill verification, no way to communicate before hiring. Features like ₹ currency formatting, Indian phone validation, and city/state-based location filtering reflect genuine user needs, not a generic template localized after the fact.

> **In summary:** LocalSkill Connect is not a to-do app, not an e-commerce clone, and not a tutorial follow-along. It is a full-featured, multi-role, real-time platform that solves a real problem — with original architecture, original UI/UX, and features that don't exist together in any other student project or commercial platform we've surveyed.

---

## 👥 Team — Authorsa

This project was conceptualized, designed, and developed entirely by our team as part of the B.Tech second year major project curriculum.

| Name | Role | Contribution |
|------|------|-------------|
| **Sanjeev Kushwaha** | Full-Stack Lead | Backend architecture, database design, API development, Socket.IO integration, deployment |
| **Payal Jaiswal** | Frontend Lead | UI/UX design, React component architecture, responsive design, Tailwind theming |
| **Nisha Verma** | Backend & Features | Authentication system, booking/rental logic, payment flow, review system |
| **Raj Srivastav** | Integration & Testing | Video call module, cost estimator workflow, API testing, documentation |

**Branch:** B.Tech CSE (Artificial Intelligence & Machine Learning)  
**Institution:** Buddha Institute of Technology, Gorakhpur, U.P., India  
**Academic Year:** 2025–2026  
**Guide:** Department of Computer Science & Engineering

---

## ✨ Features

### 🔍 Technician Discovery & Booking
- Browse technicians by **skill** (electrician, plumber, carpenter, painter, AC repair, etc.)
- Advanced filters: price range, experience level, rating, distance, availability
- Real-time **online/offline status** tracking
- Service radius display with location-based matching
- Detailed technician profiles with skills, bio, charge rates, completed jobs count
- **One-click booking** with date, time slot, and service description

### 📸 Cost Estimator (Photo/Video Upload)
- Users upload **photos and videos** of the issue (leaking pipe, broken wiring, etc.)
- Technician receives the media and provides a **detailed cost breakdown**:
  - Service/labour charge
  - Materials list (wire, pipe, switches, etc.) with individual quantities and unit prices
  - Total estimated cost and duration
- User can **review, accept, or reject** the estimate
- Accepting an estimate **auto-creates a booking** — seamless flow from estimation to hire
- Supports up to 5 files (images + videos), max 50 MB each

### 📹 Video Call Consulting (WebRTC)
- **Real-time peer-to-peer video/audio** between user and technician before booking
- User clicks **"Video Consult"** on a technician's profile page
- Technician receives an **animated incoming call notification** on any page they're browsing
- Features during call:
  - Toggle microphone (mute/unmute)
  - Toggle camera (on/off)
  - Draggable picture-in-picture self-view
  - Fullscreen mode
  - Live call duration timer
  - Connection quality indicator
- Call history stored in the database with duration tracking
- Auto-miss timeout after 60 seconds if unanswered

### 🔧 Tool & Equipment Rental
- Tool owners can list equipment (drills, welding machines, ladders, etc.) with daily pricing
- Date picker for rental period selection
- Rental status tracking: pending → approved → active → returned
- Owner dashboard for managing tool inventory and rental requests

### 📊 Role-Based Dashboards
- **User Dashboard** — view bookings, rental history, cost estimates with status tracker, payment history
- **Technician Dashboard** — manage incoming bookings, respond to cost estimates, toggle availability, view earnings
- **Tool Owner Dashboard** — manage tool listings, approve/track rentals, view rental analytics
- **Admin Dashboard** — platform-wide analytics, user/technician/tool management, moderation controls

### 🔐 Authentication & Security
- JWT-based authentication with 4 roles: `user`, `technician`, `toolowner`, `admin`
- Protected routes on both frontend and backend
- Role-based access control (middleware-enforced)
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js security headers
- CORS configuration with credential support
- Password hashing with bcrypt

### 🌙 UI/UX
- **Dark mode** with smooth toggle (persisted in localStorage)
- **Glassmorphism** design language throughout the app
- Page transition animations with Framer Motion
- Responsive design — works on mobile, tablet, and desktop
- Toast notifications for all user actions
- Loading skeletons and animated placeholders
- Star rating component with half-star support

### ⭐ Reviews & Ratings
- Users can rate and review technicians after completed jobs
- Average rating and review count displayed on profiles
- Reviews visible publicly with user name, rating, comment, and date

### 💳 Payment System
- Payment intent creation and confirmation flow
- Payment history tracking per user
- Integrated with booking lifecycle

---

## 🏗️ Tech Stack & Why We Chose It

### Backend

| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **Node.js** | Runtime | Non-blocking I/O is perfect for handling concurrent WebSocket connections (video calls) alongside REST API requests. JavaScript on both frontend and backend reduces context switching. |
| **Express.js** | Web Framework | Lightweight, unopinionated, and the most battle-tested Node.js framework. Middleware-based architecture makes it easy to add auth, error handling, rate limiting as reusable layers. |
| **MongoDB** | Database | Document-oriented storage fits our varied data shapes (user profiles, booking records, cost estimates with nested materials arrays). Schema flexibility lets us iterate fast without migrations. |
| **Mongoose** | ODM | Provides schema validation, population (joins), middleware hooks, and indexing on top of MongoDB — giving us structure without sacrificing flexibility. |
| **Socket.IO** | Real-time Communication | Handles WebSocket connections with automatic fallback to long-polling. Built-in room management is essential for our video call signaling (each call = one room). |
| **JSON Web Token (JWT)** | Authentication | Stateless auth that works across REST and WebSocket connections. The same token authenticates HTTP requests and Socket.IO handshakes. |
| **Multer** | File Upload | Handles multipart/form-data for photo/video uploads in the cost estimator feature. Supports file size limits and type filtering. |
| **Helmet** | Security | Adds HTTP security headers (CSP, HSTS, etc.) with one line of middleware. |
| **express-rate-limit** | DDoS Protection | Prevents API abuse with configurable request limits per IP. |

### Frontend

| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **React 18** | UI Library | Component-based architecture with hooks makes complex UI state (video call controls, dashboard tabs, form flows) manageable. Largest ecosystem of libraries. |
| **Vite** | Build Tool | 10x faster than Create React App. Hot Module Replacement (HMR) is near-instant, making development experience extremely fast. |
| **Tailwind CSS** | Styling | Utility-first CSS eliminates context switching between JSX and CSS files. Dark mode support is built-in (`dark:` prefix). Customization via `tailwind.config.js`. |
| **Framer Motion** | Animations | Declarative animations that integrate naturally with React's component model. Used for page transitions, card animations, incoming call notifications. |

| **react-hot-toast** | Notifications | Lightweight toast library with customizable styling. Used for booking confirmations, call events, error messages. |

### Architecture Decisions

- **WebRTC for Video Calls**: Media streams go directly between browsers (peer-to-peer). Our server only relays signaling data (offer/answer/ICE candidates via Socket.IO), not the actual video/audio. This means zero media server costs and minimal latency.
- **Separate REST + WebSocket**: REST API for CRUD operations (bookings, reviews, tools), Socket.IO for real-time events (calls, notifications). Clean separation of concerns.
- **Role-Based Middleware**: A single `authorize(...roles)` middleware function protects any route. Adding a new role requires zero code changes to the middleware.
- **Monorepo Structure**: Backend and frontend in one repository with separate `package.json` files. Simplifies development, version control, and deployment.

---

## 📁 Project Structure

```
localskill-connect/
├── backend/
│   ├── config/          # Database connection (MongoDB)
│   ├── controllers/     # Request handlers (auth, booking, estimate, call, etc.)
│   ├── middleware/       # Auth guard, error handler, file upload
│   ├── models/          # Mongoose schemas (User, Technician, Booking, Tool, etc.)
│   ├── routes/          # Express route definitions
│   ├── seeds/           # Database seeder with sample data
│   ├── socket/          # Socket.IO signaling handler for video calls
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point — Express + Socket.IO server
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable UI (Navbar, Modal, StarRating, IncomingCall, etc.)
│       ├── context/     # React Context (Auth, Theme, Call/Socket)
│       ├── pages/       # Route-level pages (Home, Dashboard, VideoCall, etc.)
│       ├── utils/       # API client, helper functions
│       ├── App.jsx      # Root component with routing
│       └── main.jsx     # Entry point with providers
├── install.bat          # One-click dependency installer (Windows)
├── start.bat            # One-click dev server launcher (Windows)
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **MongoDB** running locally or a MongoDB Atlas connection string

### Install Dependencies

```bash
# backend
cd backend
npm install

# frontend
cd frontend
npm install

### Seed the Database

Populates the database with sample technicians, tools, users, and bookings so you can explore the platform immediately.

```bash
cd backend
node seeds/seed.js
```

### Run the Application

```bash
# terminal 1 — backend (REST API + Socket.IO)
cd backend
npm run dev

# terminal 2 — frontend (Vite dev server)
cd frontend
npm run dev
```

Or on Windows,

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## 🔑 Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@localskill.com | admin123 |
| User | rahul@test.com | password123 |
| Technician | vikram@tech.com | password123 |
| Tool Owner | sanjeev@tools.com | password123 |

> **Tip:** To test video calling, log in as the **User** in one browser and the **Technician** in another browser (or incognito window). Navigate to the technician's profile and click "Video Consult".

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Technicians
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technicians` | List technicians (filters: skill, price, experience, rating, sort) |
| GET | `/api/technicians/:id` | Get technician profile with reviews |
| GET | `/api/technicians/dashboard` | Technician's own dashboard data |
| PUT | `/api/technicians/toggle-status` | Toggle online/offline status |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/my` | User's bookings |
| GET | `/api/bookings/technician` | Technician's bookings |
| PUT | `/api/bookings/:id/status` | Update booking status |

### Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List tools (filters: category, type, search, price, sort) |
| GET | `/api/tools/:id` | Get tool details |
| POST | `/api/tools` | Create tool listing |
| PUT | `/api/tools/:id` | Update tool |
| DELETE | `/api/tools/:id` | Delete tool |
| GET | `/api/tools/my` | Owner's tools |

### Rentals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rentals` | Create rental request |
| GET | `/api/rentals/my` | User's rentals |
| GET | `/api/rentals/owner` | Owner's rental requests |
| PUT | `/api/rentals/:id/status` | Update rental status |
| GET | `/api/rentals/dashboard` | Rental analytics |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews` | Get reviews |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create payment intent |
| PUT | `/api/payments/:id/confirm` | Confirm payment |
| GET | `/api/payments/history` | Payment history |

### Cost Estimates
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/estimates` | Upload photos/videos for estimate (multipart) |
| GET | `/api/estimates/my` | User's estimate requests |
| GET | `/api/estimates/:id` | Get estimate details |
| GET | `/api/estimates/technician/requests` | Technician's pending estimates |
| PUT | `/api/estimates/:id/submit-estimate` | Technician submits cost breakdown |
| PUT | `/api/estimates/:id/accept` | User accepts → auto-creates booking |
| PUT | `/api/estimates/:id/reject` | User rejects estimate |

### Video Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calls/history` | Call history for current user |
| GET | `/api/calls/:id` | Single call details |

**Socket.IO Events:** `call:initiate`, `call:accept`, `call:reject`, `call:end`, `webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`, `call:toggle-audio`, `call:toggle-video`, `user:check-online`

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform analytics |
| GET/PUT | `/api/admin/users` | Manage users |
| GET/PUT | `/api/admin/technicians` | Manage technicians |
| GET/DELETE | `/api/admin/tools` | Manage tools |

---

## 📸 Key Screens

| Screen | Description |
|--------|-------------|
| **Home** | Hero section with search, featured technicians, service categories |
| **Technician List** | Filterable grid with skill badges, ratings, online status |
| **Technician Profile** | Full profile with booking sidebar, video consult & cost estimate buttons |
| **Cost Estimate Flow** | Upload media → technician reviews → provides breakdown → user accepts |
| **Video Call** | Full-screen WebRTC call with controls, PiP self-view, call timer |
| **User Dashboard** | Tabs for bookings, rentals, estimates with status tracking |
| **Technician Dashboard** | Job management, estimate responses, availability toggle |
| **Admin Dashboard** | Platform stats, user/technician/tool management tables |

---

## 🔒 Security Measures

- **JWT Authentication** with httpOnly-compatible token flow
- **bcrypt** password hashing (10 salt rounds)
- **Helmet.js** HTTP security headers
- **CORS** restricted to frontend origin
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Role-Based Access Control** on every protected endpoint
- **Socket.IO Auth Middleware** — JWT verified on WebSocket handshake
- **File Upload Validation** — type checking + size limits on multer
- **Input Validation** via Mongoose schema constraints

---

## 🧪 How to Test the Full Flow

1. **Seed the database** — `cd backend && node seeds/seed.js`
2. **Start both servers** — backend on port 5000, frontend on port 5173
3. **Login as User** (rahul@test.com) in Browser A
4. **Login as Technician** (vikram@tech.com) in Browser B (or incognito)
5. **Browse technicians** → click a profile → try "Book Now", "Get Cost Estimate", or "Video Consult"
6. **Cost Estimate**: Upload a photo → switch to technician dashboard → fill in the estimate → switch back to user → accept it
7. **Video Call**: Click "Video Consult" on technician profile → see the incoming call in Browser B → accept → full video call
8. **Tool Rental**: Login as user → browse tools → rent one → login as tool owner (sanjeev@tools.com) → approve the rental
9. **Admin**: Login as admin → view platform-wide stats and management tables

---

## 🎯 What Makes This Project Original

This is **not** a tutorial clone or a template download. Here's what sets it apart:

1. **End-to-End Real-Time Video Calling** — Most student projects stop at REST APIs. We implemented full WebRTC video calling with Socket.IO signaling, peer-to-peer media streams, and a polished call UI with incoming notifications across any page.

2. **Photo/Video-Based Cost Estimation** — A unique pre-booking workflow where users upload media of their problem. The technician provides an itemized material + service cost breakdown. This doesn't exist in typical booking platforms.

3. **Four Distinct User Roles** — User, Technician, Tool Owner, and Admin each have purpose-built dashboards and workflows, not just different permissions on the same screens.

4. **Integrated Tool Rental Ecosystem** — The platform combines service booking AND equipment rental in one place, reflecting real-world scenarios where technicians need specific tools for a job.

5. **Production-Grade Architecture** — Rate limiting, security headers, role middleware, error handling, file upload validation, WebSocket authentication — this isn't a toy app.

6. **Built for Indian Hyperlocal Context** — Designed around the real pain points of hiring technicians in Indian cities: price transparency, trust (verified badges + reviews), and communication (video consult before committing).

---

## 📄 License

This project is developed for **academic purposes** as part of the B.Tech CSE (AI & ML) curriculum at Buddha Institute of Technology, Gorakhpur. All rights reserved by the authors.

---

## 🤝 Acknowledgements

- **Buddha Institute of Technology, Gorakhpur** — for providing the academic environment and guidance
- **Department of CSE (AI & ML)** — for project mentorship and evaluation
- Open-source communities behind Node.js, React, MongoDB, Socket.IO, simple-peer, Tailwind CSS, and all the libraries that made this possible

---

<p align="center">
  <b>Made with ❤️ by Sanjeev, Payal, Nisha & Raj</b><br/>
  <i>B.Tech CSE (AI & ML) — Buddha Institute of Technology, Gorakhpur — 2026</i>
</p>
