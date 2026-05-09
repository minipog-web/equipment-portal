# Equipment & Supplies Request System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, glassmorphic Next.js application for reporting and tracking equipment issues with email notifications and image uploads.

**Architecture:** Next.js App Router for frontend and API routes. Firebase (Firestore/Storage) for backend and data tracking. Resend for email notifications.

**Tech Stack:** Next.js 14, Firebase, Resend, Vanilla CSS (Glassmorphism).

---

## Task 1: Project Initialization & Design System

**Files:**

- Create: `package.json`, `next.config.mjs`, `jsconfig.json`
- Create: `app/layout.js`, `app/page.js`, `app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**
Run: `npx -y create-next-app@latest ./ --js --tailwind false --eslint true --app --src-dir false --import-alias "@/*"`
- [ ] **Step 2: Define global CSS with Glassmorphic variables**

```css
/* app/globals.css */
:root {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: blur(12px);
  --accent: #4dabf7;
  --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}
body {
  background: var(--bg-gradient);
  color: white;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

- [ ] **Step 3: Commit**

`git add . && git commit -m "init: scaffold next.js and design system"`

## Task 2: Firebase Integration

**Files:**

- Create: `lib/firebase.js`
- Create: `.env.local`

- [ ] **Step 1: Install Firebase SDK**
Run: `npm install firebase`
- [ ] **Step 2: Configure Firebase client**

```javascript
// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const storage = getStorage(app);
```

- [ ] **Step 3: Commit**

`git commit -m "feat: add firebase configuration"`

## Task 3: Equipment Request Form UI

**Files:**

- Create: `components/RequestForm.js`
- Modify: `app/page.js`

- [ ] **Step 1: Build the glassmorphic form component**
- [ ] **Step 2: Implement state management for form fields**
- [ ] **Step 3: Integrate image upload preview**
- [ ] **Step 4: Commit**

`git commit -m "feat: build request form UI"`

## Task 4: Submission Logic & Email Notifications

**Files:**

- Create: `app/api/submit/route.js`
- Modify: `components/RequestForm.js`

- [ ] **Step 1: Install Resend SDK**
Run: `npm install resend`
- [ ] **Step 2: Create API route for submission**
Implement logic to:

1. Upload image to Firebase Storage.
2. Save data to Firestore.
3. Send email via Resend to `adam.pogash@mec1.net`.
    *   **Note:** You MUST verify the `mec1.net` domain in the [Resend Dashboard](https://resend.com/domains) and update the `from` address in `route.js` to an email using that domain (e.g., `notifications@mec1.net`). By default, Resend only allows sending to your own login email address.

- [ ] **Step 3: Connect form to API route**
- [ ] **Step 4: Commit**

`git commit -m "feat: implement submission logic and email notifications"`

## Task 5: Admin Dashboard

**Files:**

- Create: `app/admin/page.js`
- Create: `components/AdminTable.js`

- [ ] **Step 1: Build the real-time tracking table**
- [ ] **Step 2: Implement simple password protection (Auth)**
- [ ] **Step 3: Add status update functionality**
- [ ] **Step 4: Commit**

`git commit -m "feat: build admin dashboard"`

## Task 6: Final Polish & Verification

- [ ] **Step 1: Add micro-animations (Framer Motion or CSS transitions)**
- [ ] **Step 2: Verify all form fields and email delivery**
- [ ] **Step 3: Final design audit**
- [ ] **Step 4: Commit**

`git commit -m "chore: final polish and bug fixes"`
