# Marano Eye Care Equipment Portal

A modern, glassmorphic equipment supply and maintenance reporting system built with Next.js and Firebase.

## Features
- **Public Request Form**: Easy-to-use form for reporting equipment issues or supply needs.
- **Image Uploads**: Integrated with Firebase Storage for photo documentation.
- **Admin Dashboard**: Secure dashboard for tracking, filtering, and resolving requests.
- **Email Notifications**: Real-time notifications via Resend for new requests.
- **Responsive Design**: Fully mobile-optimized with modern animations via Framer Motion.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Framer Motion
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Emails**: Resend API
- **Deployment**: Netlify

## Environment Variables
The following environment variables are required for deployment:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Admin Dashboard
NEXT_PUBLIC_ADMIN_PASSWORD=...

# Email Notifications
RESEND_API_KEY=...
```

## Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Deployment
This project is configured for deployment on **Netlify**. Ensure all environment variables are added to the Netlify dashboard under **Site settings > Environment variables**.

---
*Developed for Marano Eye Care*
