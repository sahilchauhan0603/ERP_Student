# BPIT CampusPro – ERP System - [🌐 Live Demo](https://erp-student-sm4v.onrender.com/)

A modern, full-stack ERP (Enterprise Resource Planning) system for Bhagwan Parshuram Institute of Technology (BPIT), designed to streamline student registration, administration, and dashboard management for students, faculty, and administrators.

---

## 🚀 Features

- **Student Registration:**  
  Multi-step, responsive registration for students, faculty, and non-teaching staff with document upload and review.

- **Admin Panel:**  
  - Secure admin login with OTP authentication.
  - Dashboard with statistics and charts.
  - Manage all student applications: view, approve, decline, and review details.
  - Color-coded status (approved, pending, declined).
  - Pagination for all student tables (10 per page).
  - Responsive sidebar showing logged-in admin’s email.
  - SweetAlert2 pop-ups for all important actions and errors.

- **Student Dashboard:**  
  - View personal, academic, and parent details in a clean, card-based layout.
  - Color-coded status and detail cards with readable date formats.
  - Update declined fields and resubmit for review.
  - Receive email notifications on status changes and profile updates.

- **Authentication & Security:**  
  - JWT-based authentication with HttpOnly cookies.
  - Secure backend endpoints with role-based access.
  - OTP-based login for both students and admins.

- **Responsive UI:**  
  - Fully responsive design for all pages (admin, student, registration, login).
  - Consistent color theme and modern UI using Tailwind CSS.

- **Notifications:**  
  - Email notifications for registration, approval, decline, and profile updates.
  - SweetAlert2 pop-ups for user feedback.

- **Other:**  
  - Favicon and branding.
  - “Back to Home” pop-up after logout with persistent info button.

---

## 🛠️ Tech Stack

### Frontend
- **React** (with Hooks)
- **Vite** (for fast development)
- **Tailwind CSS** (utility-first, responsive styling)
- **SweetAlert2** (modern pop-ups)
- **Chart.js** (dashboard charts)
- **Axios** (API requests)
- **React Router** (routing)

### Backend
- **Node.js** + **Express.js**
- **MySQL** (relational database)
- **JWT** (authentication)
- **Nodemailer** (email notifications)
- **Cloudinary** (document/image uploads)
- **dotenv** (environment variables)

---

## 🤔 Why This Tech Stack?

- **React + Vite:** Fast, modern, and component-based UI development with hot module reload and great DX.
- **Tailwind CSS:** Rapid, consistent, and responsive styling with utility classes.
- **Express + Node.js:** Lightweight, flexible, and widely adopted for REST APIs.
- **MySQL:** Reliable, relational data storage for structured student/admin data.
- **JWT + HttpOnly Cookies:** Secure, stateless authentication.
- **SweetAlert2:** User-friendly, attractive pop-ups for all feedback and alerts.
- **Cloudinary:** Hassle-free, scalable file and image uploads.
- **Nodemailer:** Reliable email delivery for notifications and OTPs.

---

## 📦 Project Structure

```
newERP/
  client/         # Frontend (React, Vite, Tailwind)
    src/
      components/
      pages/
      assets/
      ...
    public/
    index.html
    package.json
    ...
  server/         # Backend (Node.js, Express, MySQL)
    controllers/
    routes/
    config/
    utils/
    ...
  README.md       # Project documentation
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- MySQL server
- Cloudinary account (for uploads)
- Email SMTP credentials (for notifications)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ERP_Student.git
cd ERP_Student
```

### 2. Setup the Backend

```bash
cd server
npm install
# Configure .env with DB, JWT, Cloudinary, and email credentials
npm start
```

### 3. Setup the Frontend

```bash
cd ../client
npm install
npm run dev
```

### 4. Access the App

- Student Portal: `https://erp-student-sm4v.onrender.com/login`
- Admin Portal: `https://erp-student-sm4v.onrender.com/admin`

---

## 📧 Email & Notification Flows

- **On registration:** Student receives confirmation email.
- **On admin approval/decline:** Student receives status email.
- **On student profile update (after decline):** Student receives “profile resubmitted” email.
- **On logout:** User sees a “Back to Home?” pop-up, with a persistent info button if dismissed.

---

## 🖼️ Screenshots

### HomePage
![HomePage](./screenshots/Homepage.png)

### Admin Panel
![Admin Panel](./screenshots/AdminDashboard.png)

### Student Dashboard
![Student Dashboard](./screenshots/StudentDashboard.png)

### Student Login Page
![Registration Page](./screenshots/StudentLogin.png)

### Admin Login Page
![Registration Page](./screenshots/AdminLogin.png)

---

## 📄 License

This project is for educational purposes. All rights reserved © BPIT.

---

## 🙏 Acknowledgements

- BPIT for the use case and branding.
- [Vite](https://vitejs.dev/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [SweetAlert2](https://sweetalert2.github.io/), [Cloudinary](https://cloudinary.com/), [Nodemailer](https://nodemailer.com/), and all open-source contributors.
