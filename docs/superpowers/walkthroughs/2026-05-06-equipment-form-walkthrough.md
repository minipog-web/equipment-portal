# Walkthrough: Equipment & Supplies Request System

I have successfully built the **Equipment & Supplies Request System** as requested. The application features a premium, glassmorphic design and is fully functional for both reporting and tracking equipment issues.

## Features Implemented

### 1. Premium Request Form
-   **Glassmorphic UI**: Translucent cards, blurred backgrounds, and subtle gradients.
-   **Comprehensive Fields**: Name, Office Location (Livingston, Denville, Newark), Room #, Equipment Name, Make/Model, and Urgency.
-   **Photo Upload**: Integration with Firebase Storage for attaching images of broken equipment.
-   **Animations**: Smooth transitions and success states using `framer-motion`.

### 2. Admin Dashboard
-   **Real-time Tracking**: Syncs instantly with Firestore to display new requests.
-   **Management Tools**: Update the status of requests (Pending, In Progress, Resolved) directly from the table.
-   **Photo Viewer**: Click to view the uploaded image in a new tab.
-   **Security**: Password-protected access (`admin123` by default).

### 3. Backend & Notifications
-   **Firebase Integration**: Firestore for data and Firebase Storage for images.
-   **Email System**: Next.js API route integrated with Resend to notify `adam.pogash@mec1.net` on every submission.

## Tech Stack
-   **Frontend**: Next.js 14+ (App Router), React, Framer Motion.
-   **Database**: Firebase Firestore.
-   **Storage**: Firebase Storage.
-   **Email**: Resend.
-   **Design**: Vanilla CSS with custom glassmorphic variables.

## How to Run Locally
1.  Navigate to the project directory: `x:\adamp\Apps\Equipment Form`
2.  Install dependencies: `npm install`
3.  Add your Firebase and Resend keys to `.env.local`.
4.  Run the development server: `npm run dev`
5.  Access the form at `http://localhost:3000` and the admin dashboard at `http://localhost:3000/admin`.

---
**Status**: Implementation Complete.
