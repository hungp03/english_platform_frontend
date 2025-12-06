# English Learning Platform - Frontend

A modern, responsive web application for an English learning platform built with Next.js 15 and React 19.

## Overview

This frontend application provides a complete user interface for online English learning, featuring course browsing, AI-powered speaking and writing assessments, quiz systems, e-commerce checkout, and community features.

## Features

### Student Portal
- **Course Catalog**: Browse, search, and filter courses by skill focus and pricing
- **Course Learning**: Video lessons, multimedia content, progress tracking
- **Quiz System**: Interactive quizzes with multiple question types
- **AI Assessment**: Speaking (audio recording) and Writing submissions with AI feedback
- **Mock Tests**: Practice tests simulating real English proficiency exams
- **Study Plans**: Personal study schedules with Google Calendar sync
- **My Courses**: Dashboard for enrolled courses and learning progress

### Instructor Portal
- **Course Management**: Create and manage courses, modules, and lessons
- **Wallet System**: View earnings, transaction history, request withdrawals
- **Analytics**: Track course performance and student engagement

### Admin Dashboard
- **User Management**: Manage users and roles
- **Course Approval**: Review and approve instructor courses
- **Quiz Management**: Create quiz types, sections, and questions
- **Order Management**: View and manage platform orders
- **Forum Moderation**: Manage forum categories, moderate content and reports
- **Withdrawal Requests**: Process instructor withdrawal requests
- **Content Management**: Blog posts and platform content

### Community
- **Blog**: Read and interact with educational blog posts
- **Discussion Forum**: Community discussions with categories and threads
- **Course Reviews**: Read and write course reviews

### E-Commerce
- **Shopping Cart**: Add courses, manage cart items
- **Checkout**: Secure payment with PayOS (VND) or PayPal (USD)
- **Order History**: View purchase history and invoices

### Account
- **Profile Management**: Update personal information and avatar
- **Authentication**: Email/password login, Google OAuth2
- **Notifications**: Real-time push notifications

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | React 19, JavaScript |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI, Lucide Icons |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Rich Text Editor | React Quill |
| Charts | Recharts |
| Date Handling | date-fns, Day.js |

## Project Structure

```
frontend/
├── app/
│   ├── (admin)/admin/      # Admin dashboard pages
│   ├── (instructor)/       # Instructor portal pages
│   ├── (site)/             # Public & student pages
│   │   ├── auth/           # Login, register
│   │   ├── blog/           # Blog pages
│   │   ├── cart/           # Shopping cart
│   │   ├── courses/        # Course catalog & details
│   │   ├── forum/          # Community forum
│   │   ├── mock-tests/     # Practice tests
│   │   ├── my-courses/     # Enrolled courses
│   │   ├── payment/        # Checkout & payment
│   │   ├── practice/       # Skill practice
│   │   └── quizzes/        # Quiz pages
│   └── forbidden/          # Access denied page
├── components/
│   ├── account/            # Profile components
│   ├── admin/              # Admin UI components
│   ├── assessment/         # Speaking/Writing assessment
│   ├── cart/               # Cart components
│   ├── common/             # Shared components
│   ├── courses/            # Course UI components
│   ├── forum/              # Forum components
│   ├── instructor/         # Instructor components
│   ├── notification/       # Notification components
│   ├── practice/           # Practice components
│   ├── quiz/               # Quiz components
│   └── ui/                 # Base UI components (shadcn/ui)
├── hooks/                  # Custom React hooks
├── lib/
│   └── api/                # API service modules
├── store/                  # Zustand stores
│   ├── auth-store.js       # Authentication state
│   ├── cart-store.js       # Shopping cart state
│   ├── enrollment-store.js # Enrollment state
│   └── notification-store.js # Notifications state
└── public/                 # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Environment Variables

Create a `.env` file:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Firebase Config (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

## API Integration

The frontend communicates with the backend API through:
- Axios HTTP client with interceptors for authentication
- API proxy via Next.js rewrites (`/api/*` -> backend)
- JWT token management with automatic refresh

## License

This project is proprietary software. All rights reserved.
