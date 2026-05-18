# Design Spec: Claiming Equipment Problems with Case Details

An upgrade to the Marano Eye Care Admin Dashboard, enabling staff/technicians to claim active equipment problems inline, enter custom case details, and update or resolve them.

## 1. Overview

Currently, requests are marked "Pending", "In Progress", or "Resolved" through static status actions. There is no way to record *who* is handling a request or *what* action is being taken (e.g. ordered a part, arriving next week). 

This design introduces a cohesive, inline **"Claim"** workflow directly in the admin dashboard table rows:
1. **Claiming**: Staff can click "Claim" to assign themselves to a request, specifying their name and adding specific case details.
2. **Status Shift**: Claiming a request automatically transitions its status to **"In Progress"**.
3. **Tracking & Transparency**: The dashboard displays who claimed the request and shows their case notes inline, allowing other staff to see exactly what is being done.
4. **Editing**: Staff can edit their case notes at any time to add updates.

## 2. Data Model Updates

In Firestore, each request document in the `requests` collection will support the following optional fields:

- `claimedBy`: `String` (The name of the staff member/technician claiming the request)
- `caseDetails`: `String` (A custom note describing the action plan or current case status)
- `claimedAt`: `Timestamp` (When the request was claimed)
- `status`: Updated to `"In Progress"` upon claiming, and `"Resolved"` upon completion.

## 3. User Interface & Interactions

The new workflow will be integrated directly into the `app/admin/page.js` request table:

### State A: Unclaimed / Pending Request
- The row displays the status as **"Pending"** (or unclaimed **"In Progress"**).
- The actions column features a **"⚙️ Claim"** button instead of a generic "Start" button.
- Clicking **"⚙️ Claim"** expands an inline, glassmorphic form *inside* that specific row.

### State B: Inline Claim Form (Active)
- Expands within the row's layout.
- **Your Name Input**: Text field. We will save this name in the browser's `localStorage` so staff don't have to re-type it for subsequent claims.
- **Case Details Textarea**: A multiline input where the technician can write details (e.g., *"Ordered replacement bulb, arriving Tuesday"*).
- **Actions**:
  - **"Confirm Claim"** button: Updates Firestore, sets status to `"In Progress"`, and saves the name to `localStorage`.
  - **"Cancel"** button: Closes the form and returns to State A.

### State C: Claimed / In Progress Request
- The status is shown as **"In Progress"**.
- Under the status/actions area or in a dedicated spot, it displays a premium badge: `🛠️ Claimed by [Name]`.
- The custom notes are shown inline: `[Quote Bubble Style] "Case details description"`.
- The actions column shows:
  - **"📝 Edit Details"**: Re-opens the inline form to edit the case notes.
  - **"✅ Resolve"**: Marks the request as resolved.

## 4. Design & Style Details
- **Glassmorphism Integration**: Textareas and inputs will use the `.glass-input` styling for look and feel consistency.
- **Color Coding**: Claimed info will use `var(--accent)` (#7292c9) to distinguish active claims from completed tasks.
- **Smooth Animation**: Transitions when expanding/collapsing forms will be clean and micro-animated.

## 5. Security & Deployment
- The simple password-based dashboard access will continue to guard this interface.
- No modifications are needed to the employee-facing submission form.

---
**Status**: Ready for User Review.
