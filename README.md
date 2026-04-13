# SOS Full Stack - Education Management System

A comprehensive, high-performance education management platform featuring a modern Next.js 15 frontend and a robust PHP MVC backend. This project serves as a unified hub for student registration, task submission, and administrative grading.

## 🚀 Key Features

### 🎓 Student Portal
- **WinPharma Interactive Dashboard**: A refined view for student enrollments and levels.
- **Modernized Task Interface**: A responsive, tabbed mobile experience for viewing task details and submitting work.
- **Real-time Feedback**: Direct access to assessor feedback with highly visible notifications for corrections.

### 🛠️ Admin Panel
- **Advanced Grading Interface**: A multi-format submission viewer supporting both **Images** and **PDFs**.
- **Mobile-Friendly Design**: Tabbed mobile layout for grading on the go, allowing admins to toggle between submission previews and the grading console.
- **Batch Management**: Automated descending sort for course batches and student enrollments.

## 💻 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query, Radix UI.
- **Backend**: Custom PHP MVC Architecture with MySQL integration.
- **Assets**: Dynamic image and PDF handling with automatic format detection.

## 📁 Project Structure

```text
.
├── client/          # Next.js Frontend
│   ├── src/app/     # Application Routes (Dashboard, Admin, WinPharma)
│   ├── src/hooks/   # Custom React Hooks (Mobile detection, etc.)
│   └── public/      # Static Assets
└── server/          # PHP MVC Backend
    ├── controllers/ # Logic for WinPharma, Payments, etc.
    ├── models/      # Database interaction (MySQL)
    └── uploads/     # Student submissions (Images/PDFs)
```

## ⚙️ Setup & Installation

### Frontend (Client)
1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend (Server)
1. Ensure you have a PHP-capable server (e.g., XAMPP, Apache).
2. Point your server root (or use a virtual host) to the `server` directory.
3. Configure the `.env` file with your MySQL database credentials.
4. Run migrations using the provided scripts in `server/migrations`.

## 🎨 UI/UX Standards
This project follows a premium, high-contrast design language:
- **Dark Mode**: Optimized for focus and high readability.
- **Glassmorphism**: Modern UI elements with blurred backgrounds and subtle borders.
- **Responsiveness**: Deeply customized breakpoints (`md` = 768px, `lg` = 1024px) for seamless transitions between mobile, tablet, and desktop.

---
Produced by the SOS Development Team.
