# V-CTRIP: Veritas Cyber Threat Reporting & Intelligence Platform

V-CTRIP is a comprehensive web-based platform designed for reporting, tracking, and analyzing cyber threats. Built with a focus on defense-in-depth and modern security practices, it serves as a central hub for threat intelligence and incident management.

- **Intelligent Security Assistant**: AI-powered (simulated) chatbot for instant security guidance and system statistics.
- **Real-time Incident Alerts**: WebSocket-driven notifications for critical threat detections.
- **Emergency Panic Button**: Instantly trigger high-priority alerts across the system for immediate response.
- **Dynamic Threat Visualization**: Modern dashboards using Recharts for real-time analytics and data-driven insights.
- **Veritas University Branding**: Tailored UI with university identity and "Seeking the Truth" motto.
- **Anonymous Threat Reporting**: Safely report incidents with optional anonymity.
- **Incident Lifecycle Management**: Track reports from Open to Investigation and Resolution.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Students, Staff, Analysts (Security), and Admins.
- **Advanced Security**: Implements JWT (RS256), bcrypt hashing, rate limiting, and secure HTTP headers.
- **Audit Logging**: Comprehensive tracking of all critical system actions for forensic purposes.

## Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **TailwindCSS** for styling
- **Chart.js** for analytics visualization
- **React Router** for navigation

### Backend
- **NestJS** (Node.js framework)
- **TypeScript**
- **Prisma ORM** for database management
- **Passport.js** for authentication
- **PostgreSQL** (Database)

## Project Structure

```text
RESEARCH SEMINAR PROJECT/
├── backend/            # NestJS application
│   ├── src/           # API source code
│   ├── prisma/        # Database schema & migrations
│   └── secrets/       # Security keys (RSA)
├── frontend/           # React application
│   └── src/           # UI source code
└── docker-compose.yml  # Container orchestration
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Npm or Yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd RESEARCH-SEMINAR-PROJECT
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Configure .env file with your DATABASE_URL
   # For local PostgreSQL: postgresql://postgres:YOUR_PASSWORD@localhost:5432/vctrip
   npx prisma generate
   npx prisma db push
   npx ts-node prisma/seed-demo.ts
   npm run start:dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Configure .env file
   npm run dev
   ```

## Deployment

## Deployment

### Vercel (Optimized Serverless)
1.  **Backend API**: Import and set **Root Directory** to `backend`. Add `DATABASE_URL` and `JWT` keys. Vercel will auto-configure via `backend/vercel.json`.
2.  **Frontend App**: Import and set **Root Directory** to `frontend`. Add `VITE_API_URL` pointing to the backend deployment.

### Render (Full Stack Blueprint)
The project includes a `render.yaml` for one-click deployment. Create a "Blueprint" on Render.com and connect this repository for automated database, API, and frontend provisioning.


## Security Implementation

V-CTRIP follows the OWASP Top 10 mitigations and industry-standard security patterns:
- **Authentication**: JWT with RS256 asymmetric signing.
- **Password Security**: Adaptive bcrypt hashing with salt.
- **API Security**: Helmet.js, Rate Limiting, and CORS protection.
- **Data Protection**: Parameterized queries via Prisma to prevent SQL Injection.
- **Input Validation**: Global validation pipes for strict DTO checking.

## License

This project is developed as part of a Research Seminar. All rights reserved.
