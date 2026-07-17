# Automated Business Metric Engine 🚀

A highly-scalable Full Stack Enterprise application designed to ingest massive CSV datasets, process them via robust batch pipelines, recalculate critical business metrics in a PostgreSQL database, and serve rich, interactive analytics to a modern Angular dashboard.

## 🏗️ Architecture Overview

The system bridges robust Spring Boot backend processing with a dynamic Angular frontend:

1. **CSV Ingestion Layer**: Users drag-and-drop CSV files via the Angular frontend.
2. **Spring Batch Processing**: The Spring Boot backend safely validates, chunks, and imports the data without overloading memory.
3. **PostgreSQL Database**: Highly structured relational tables store raw data and calculated metrics.
4. **Metric Calculation Engine**: A dedicated service recalculates KPIs (Revenue, Orders, Trends) dynamically.
5. **REST API**: Spring Boot exposes endpoints for the Angular client to securely consume.
6. **Angular Dashboard**: A sleek, dark/light mode responsive dashboard providing Charts, Reports, Job Monitoring, and System Configuration.

## ✨ Key Features

- **Dynamic Interactive Dashboard**: Built with Angular 15+ and Chart.js. Includes interactive Revenue Trends, Category breakdowns, and Order Volume analysis.
- **Enterprise Job Scheduler**: Monitor and control background Spring Batch jobs directly from the UI.
- **Robust File Uploads**: Drag-and-drop functionality with real-time success/failure validation.
- **PDF & Excel Reporting**: Generate business reports and export them seamlessly.
- **Full Theme Support**: Polished UI with seamless Light and Dark Mode switching using CSS variables.
- **Mock Authentication**: Ready-to-scale Role-Based Access Control (RBAC) UI layout.

## 🛠️ Technology Stack

### Backend
- Java 17
- Spring Boot 3.1
- Spring Batch (Data Pipeline)
- Spring Data JPA
- PostgreSQL (Database)
- Maven

### Frontend
- Angular 15+
- Angular Material (UI Components)
- Chart.js & ng2-charts (Data Visualization)
- SCSS / Modern CSS Variables

## 🚀 Getting Started (Local Development)

### Prerequisites
- Java 17+ installed
- Node.js (v18+) installed
- PostgreSQL (running locally or via Docker)

### 1. Database Setup
Create a PostgreSQL database named `metric_engine` (or update `application.properties` with your credentials).
```sql
CREATE DATABASE metric_engine;
```

### 2. Backend Setup
Navigate to the root directory and run the Spring Boot application using Maven:
```bash
./mvnw spring-boot:run
```
The API will start on `http://localhost:8080`.

### 3. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run start
```
The Dashboard will be accessible at `http://localhost:4200`.

## 📦 Deployment Guidance

This application is split into two distinct tiers (Backend API and Frontend SPA).

**Recommended Platforms:**
- **Render.com**: Deploy the PostgreSQL DB, Spring Boot Web Service, and Angular Static Site all from a single dashboard linked to this GitHub repo.
- **Railway.app**: Similar to Render, excellent for quick Docker-based deployments.

**Deployment Steps (High-Level):**
1. **Database**: Spin up a managed PostgreSQL instance.
2. **Backend**: Provide the `DATABASE_URL` environment variable to the Spring Boot instance. Run the standard `mvn clean package` build command.
3. **Frontend**: Update the `environment.prod.ts` API URL to point to your live Spring Boot URL. Build using `npm run build` and serve the `dist/` folder via a static site host (Render, Vercel, Netlify).

## 📄 License
This project is licensed under the MIT License.
