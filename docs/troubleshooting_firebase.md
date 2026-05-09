# Troubleshooting: Form Submission Hanging

The "Submitting..." hang you're experiencing is caused by **Cloud Firestore** and **Firebase Storage** being disabled or uninitialized in your Google Cloud/Firebase project.

Because these services are not yet "awake" for your project `mec-equipment-form`, the app waits for a response from Google's servers that never arrives, eventually leading to a timeout.

## Steps to Fix

### 1. Enable Cloud Firestore

1. Go to the [Firestore API Overview](https://console.cloud.google.com/apis/api/firestore.googleapis.com/overview?project=mec-equipment-form).
2. Click the **ENABLE** button.
3. Once enabled, go to the [Firestore Database page](https://console.firebase.google.com/project/mec-equipment-form/firestore).
4. Click **Create Database**.
5. Select **Native Mode** (not Datastore mode).
6. Choose a location (e.g., `us-east1`).
7. Start in **Production Mode**.

### 2. Enable Firebase Storage (For Photos)

1. Go to the [Firebase Storage page](https://console.firebase.google.com/project/mec-equipment-form/storage).
2. Click **Get Started**.
3. Follow the wizard to initialize your bucket.
4. Go to the **Rules** tab and ensure it allows uploads (for testing, you can use: `allow read, write: if true;` — though we will tighten this later).

### 3. Verify Resend API

I have verified that your Resend API key is valid. Once Firestore is enabled, the email notifications will also start sending automatically.

## Technical Improvements Made

I have updated the code to handle these "hangs" more gracefully:

- **Server-Side Timeout**: I've added a 10-second timeout to the database call on the server so the app tells you it failed instead of spinning forever.
- **Improved Logging**: Added more detailed logs to help us trace exactly where the submission fails if it happens again.

> [!IMPORTANT]
> After you enable these services in the Google Cloud Console, the form should work immediately without any further code changes.
