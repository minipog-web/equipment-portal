# Design Doc: Equipment & Supplies Request System

A premium, glassmorphic web application for reporting broken or low-stock equipment across company offices, featuring real-time tracking and email notifications.

## 1. Overview

The system consists of two primary interfaces:

1. **Request Form**: A publicly accessible (internal) form for employees to report equipment issues.
2. **Admin Dashboard**: A secure interface for tracking, viewing, and managing the status of these requests.

## 2. User Experience & Design

- **Aesthetic**: "Glassmorphism" — Translucent backgrounds, `backdrop-filter: blur()`, soft gradients (Slate/Blue/Teal), and high-quality typography (Inter/Outfit).
- **Responsiveness**: Fully responsive for desktop and mobile use.
- **Submission Feedback**: Animated success state after a request is submitted.

## 3. Functional Requirements

### Request Form Fields

- **Name**: String (Required)
- **Office Location**: Enum (Livingston, Denville, Newark)
- **Room Number**: String/Number (Required)
- **Equipment Name**: String (Required)
- **Make/Model/Serial**: String (Optional but encouraged)
- **Urgency**: Enum (Low, Medium, High)
- **Image Upload**: Optional file upload (images only)

### Submission Actions

- **Email Notification**: Send a formatted email to `adam.pogash@mec1.net` and `veronica.olivera@mec1.net`.
- **Data Persistence**: Save the request and image URL to a Firestore database.
- **Admin Tracking**: The submission appears instantly on the Admin Dashboard.

### Admin Dashboard

- **Authentication**: Simple password-based entry.
- **List View**: Sortable/filterable table of all requests.
- **Detail View**: View full details, including the uploaded image.
- **Status Management**: Mark requests as "Pending", "In Progress", or "Resolved".

## 4. Technical Architecture
-   **Framework**: Next.js 14+ (App Router).
-   **Backend/Database**: Firebase (Firestore).
-   **Storage**: Firebase Storage (for images).
-   **Emailing**: Next.js API Route using `Resend`.
-   **Styling**: Vanilla CSS with Glassmorphism utility classes.

## 5. Security & Deployment
-   **Form Security**: Rate limiting and honeypot field to prevent spam.
-   **Admin Security**: Simple environment-variable based password protection.
-   **Deployment**: Vercel or similar platform.

---
**Status**: Ready for Implementation Plan.
