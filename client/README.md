# SOS Dashboard - Frontend

This is the Next.js 15 frontend for the SOS Education Management System. It provides a highly interactive and responsive interface for students and administrators.

## 🏗️ Architecture

- **Framework**: Next.js 15 with App Router.
- **Styling**: Tailwind CSS with custom configuration for premium dark mode aesthetics.
- **State Management**: 
  - **Server State**: TanStack Query (React Query) for efficient API data fetching and caching.
  - **Local State**: Native React Context and Hooks.
- **Components**: Radix UI primitives integrated with Shadcn/UI for consistent, accessible interface elements.

## 📱 Mobile-First Features

- **Tabbed Navigation**: Both the Admin Grading panel and the Student Task view implement a tabbed mobile interface to optimize screen real estate.
- **Responsive Hooks**: Uses a custom `useIsMobile` hook to dynamically adjust layouts based on screen width.
- **Dynamic Previews**: Built-in support for Image and PDF viewing with automatic format detection.

## 🛠️ Development

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create/Configure `.env`:
   Make sure to set your API base URLs for the PHP server.

### Available Scripts
- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Creates an optimized production bundle.
- `npm run start`: Runs the built application in production mode.

## 🎨 Theme & Design
The frontend uses a custom color palette defined in `tailwind.config.ts`, featuring:
- **Primary**: Focused on vibrancy and brand identity.
- **Zinc/Surface**: High-contrast dark surfaces with subtle borders (`white/5`).
- **Glassmorphism**: Backdrop blur and transparency used across modals and navigation bars.

---
Part of the SOS Full Stack Project.
