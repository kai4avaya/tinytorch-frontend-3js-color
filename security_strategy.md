### Securing Pages in a Vanilla HTML/JS Application

Since your application is a static site (HTML/CSS/JS) without a backend server rendering the pages (like PHP, Next.js, or Django), you cannot **physically** prevent a user from downloading the `dashboard.html` file if they know the URL. The browser simply requests the file, and the server serves it.

However, you **can** effectively restrict access and protect data by combining **Client-Side Checks** with **Server-Side Data Protection**.

---

### 1. Client-Side Redirection (The "Bouncer")

This is the first line of defense. You run a script immediately when the page loads to check if the user is "logged in".

**How it works:**
1.  The user navigates to `/dashboard.html`.
2.  A script at the very top of `<head>` checks `localStorage` for your `tinytorch_token`.
3.  If the token is missing, it immediately redirects the user to `index.html` (or the login page).

**Implementation for `dashboard.html`:**

```html
<head>
    <script>
        // 1. Immediate Check
        const token = localStorage.getItem("tinytorch_token");
        if (!token) {
            // User is not logged in -> Redirect immediately
            window.location.href = '/index.html'; 
        }
    </script>
    <!-- Rest of your dashboard CSS/JS -->
</head>
```

**Pros:**
*   Fast.
*   Simple to implement.
*   Prevents the average user from seeing the dashboard UI.

**Cons:**
*   **Not Secure:** A savvy user can disable JavaScript or use `curl` to download the HTML source code of the dashboard. They can see the *structure* of your page (buttons, empty tables, etc.).

---

### 2. Server-Side Data Protection (The "Vault")

This is where the *real* security lives. Even if a hacker bypasses the redirection script and sees your empty dashboard HTML, **they must not be able to see any private data**.

**How it works:**
1.  Your dashboard HTML should contain **zero** user data hardcoded in it. It should be a blank template.
2.  After the page loads, your JavaScript makes an API call (e.g., `fetch('/api/user-data')`) to your backend (Next.js) to get the actual data.
3.  **Crucially:** This API call includes the `Authorization: Bearer <token>` header.
4.  Your backend validates the token.
    *   **Valid:** Returns the data (JSON).
    *   **Invalid:** Returns `401 Unauthorized`.

**Implementation:**

```javascript
// dashboard.js

async function loadDashboardData() {
    const token = localStorage.getItem("tinytorch_token");

    const response = await fetch('https://tinytorch.netlify.app/api/dashboard-data', {
        headers: {
            'Authorization': `Bearer ${token}` // The key to the vault
        }
    });

    if (response.status === 401) {
        // Token is invalid or expired -> Redirect
        alert("Session expired. Please login again.");
        localStorage.removeItem("tinytorch_token");
        window.location.href = '/index.html';
        return;
    }

    const data = await response.json();
    // Now render the data into the HTML...
}
```

---

### Summary of the Strategy

1.  **The Gatekeeper (Client-Side):** Use a `<script>` block in the `<head>` of protected pages to bounce non-logged-in users back to the home page. This provides a good User Experience (UX).
2.  **The Vault (API):** Never render private data directly in the HTML. Always fetch it via API using the authentication token. This ensures that even if someone steals your HTML file, they can't see anyone's personal information.

### Recommendation for `dashboard.html`

I can help you modify your `dashboard.html` to include this protection mechanism. We should:
1.  Add the "Gatekeeper" script to the top of the file.
2.  Ensure the layout rendering (fetching the user's session) handles the "logout" button correctly.
