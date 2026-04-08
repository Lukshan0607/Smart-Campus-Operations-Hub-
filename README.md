# 🎓 Smart Campus Operations Hub

A full-stack web application developed for managing university facility bookings and maintenance operations. This system is built as part of the **IT3030 – Programming Applications and Frameworks (PAF) Assignment 2026**.
3rd year 1st semester group project | java (Spring Boot) Rest API + React Frontend

---

## 📌 Project Overview

The **Smart Campus Operations Hub** is a centralized platform designed to:

* Manage facility and asset bookings (rooms, labs, equipment)
* Handle maintenance and incident reporting
* Provide role-based access for users, admins, and technicians
* Ensure clear workflows and system auditability

---

## 🚀 Tech Stack

### 🔙 Backend

* Java (Spring Boot)
* Spring Security (OAuth 2.0)
* Spring Data JPA
* MySQL

### 🌐 Frontend

* React.js
* Axios
* React Router

### ⚙️ Tools

* Git & GitHub
* Postman (API Testing)
* GitHub Actions (CI/CD)

---

## 🧩 Features

### 📦 Module A – Facilities & Assets

* Manage rooms, labs, and equipment
* Search and filter resources
* Track availability and status

### 📅 Module B – Booking System

* Request bookings with time/date
* Approval workflow (PENDING → APPROVED/REJECTED)
* Conflict detection (no overlapping bookings)

### 🛠 Module C – Maintenance Tickets

* Report issues with description and images
* Assign technicians
* Track status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)

### 🔔 Module D – Notifications

* Real-time updates for bookings and tickets
* Notification panel in UI

### 🔐 Module E – Authentication & Authorization

* Google OAuth 2.0 login
* Role-based access control (USER, ADMIN, TECHNICIAN)

---

## 🗄 Database Design

Main entities:

* User
* Resource
* Booking
* Ticket
* Comment
* Attachment
* Notification

(Relationships implemented using JPA)



# 🚀 Setup Guide (For New Members)

## 🔹 Step 1 – Clone the Repository

```bash
git clone https://github.com/Lukshan0607/Smart-Campus-Operations-Hub.git
cd Smart-Campus-Operations-Hub
```

---

## 🔹 Step 2 – Install Required Software

Make sure you have installed:

* Java JDK 21
* Node.js (v18+)
* MySQL
* Git

---

## 🔹 Step 3 – Setup Backend

```bash
cd BACKEND
```

### ▶ Configure Database

Open:

```
src/main/resources/application.properties
```

Update:

```
spring.datasource.url=jdbc:mysql://localhost:3306/smartcampus_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### ▶ Create Database

```sql
CREATE DATABASE smartcampus_db;
```

### ▶ Run Backend

```bash
mvn spring-boot:run
```

Backend runs on:

```
http://localhost:8083
```

---

## 🔹 Step 4 – Setup Frontend

```bash
cd frontend
npm install
```

### ▶ Install additional dependencies

```bash
npm install axios
```

### ▶ Run Frontend

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5174
```

---

## 🔹 Step 5 – Git Ignore Notes ⚠️

Already configured `.gitignore` (DO NOT change):

Ignored folders:

* `frontend/node_modules`
* `backend/target`
* `.env`
* `.vscode`

❗ Do NOT commit these files

---

## 🔹 Step 6 – Project Structure

```
smart-campus-system/
│
├── backend/        # Spring Boot API
├── frontend/       # React App
├── .gitignore
└── README.md
```

---

## 🔹 Step 7 – Daily Workflow (IMPORTANT)

Before starting work:

```bash
git pull origin main
```

After completing work:

```bash
git add .
git commit -m "your feature description"
git push
```

---

## 🔹 Step 8 – Branch Workflow

Each member should work on separate branches:

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/booking-system
```

---

## 🔹 Step 9 – API Testing

Use:

* Postman OR
* Browser (for GET APIs)

---

## 🔹 Step 10 – Common Issues & Fixes

### ❌ Port already in use

Change port in:

```
application.properties
```

### ❌ Backend not connecting

Check:

* MySQL running
* Database created

### ❌ CORS Error

Make sure controller has:

```java
@CrossOrigin
```

---

# ✅ Project Status

✔ Backend Setup Complete
✔ Frontend Setup Complete
✔ GitHub Integration Complete

---

# 📌 Notes

* Commit regularly (important for marks)
* Do not push unnecessary files
* Each member must contribute APIs

---

# 🎯 Future Enhancements

* OAuth Login (Google)
* Notification system
* Admin dashboard

---

---

