# Session Expiry Error Handling Implementation

## Overview

This document describes how session expiry (401 Unauthorized errors) is now handled throughout the frontend application.

## Components & Files

### 1. **API Helper** (`lib/api-helper.ts`)

Centralized API service that:

- Wraps all fetch calls
- Automatically detects 401 (Unauthorized) responses
- Clears invalid tokens from localStorage
- Throws `SESSION_EXPIRED` error for easy identification
- Triggers a registered callback function when session expires

**Key Features:**

- `ApiHelper.fetch()` - Basic fetch wrapper with auth token handling
- `ApiHelper.json()` - Fetch + JSON parsing for data endpoints
- `ApiHelper.uploadFile()` - File upload with proper 401 handling
- `setSessionExpiredCallback()` - Register callback for session expiry

### 2. **Session Expiry Hook** (`hooks/useSessionExpiry.ts`)

React hook that:

- Registers the session expiry callback
- Handles user logout automatically
- Clears all session data
- Redirects user to login page after 2 seconds
- Manages notification state

**Usage:**

```tsx
const { showMessage, dismissMessage } = useSessionExpiry();
```

### 3. **Session Expired Notification Component** (`components/SessionExpiredNotification.tsx`)

Global notification component that:

- Displays user-friendly message: "Your session expired. Please log in again to continue shopping."
- Shows a warning icon for clarity
- Allows manual dismissal
- Auto-hides after component redirects to login

### 4. **Updated Checkout Form** (`components/checkout/CheckoutForm.tsx`)

Now uses `ApiHelper` instead of direct fetch:

- Order creation uses `ApiHelper.fetch()`
- Payment verification uses `ApiHelper.fetch()`
- Catches `SESSION_EXPIRED` errors and shows appropriate message
- Automatic logout and redirect handled by hook

### 5. **Updated Orders Hook** (`hooks/useOrders.ts`)

Now uses `ApiHelper`:

- Fetches orders with proper auth handling
- Converts `SESSION_EXPIRED` errors to user-friendly messages
- Handles order cancellation with 401 error detection

### 6. **Updated Layout** (`app/layout.tsx`)

- Added `SessionExpiredNotification` component globally
- Positioned inside `AuthProvider` for access to logout function
- Notifications appear at top of page when session expires

## How It Works

### User's Session Expires

1. **API Call Fails with 401**
   - Any API call (`ApiHelper.fetch()`, `ApiHelper.json()`, or `ApiHelper.uploadFile()`) receives a 401 response

2. **ApiHelper Detects 401**
   - Clears the invalid token from localStorage
   - Throws `SESSION_EXPIRED` error
   - Triggers the registered callback

3. **Session Expiry Handler Runs**
   - `useSessionExpiry` hook's callback is triggered
   - Calls logout from AuthContext (clears user data)
   - Sets `showMessage` state to true
   - Notification component displays message

4. **User Sees Clear Message**
   - "Your session expired. Please log in again to continue shopping."
   - User can dismiss the alert
   - Auto-redirects to login page after 2 seconds

5. **Automatic Redirect**
   - User is redirected to `/login` page
   - Next login attempt requires fresh credentials

## Error Message Mapping

| Scenario                                    | User Sees                                   |
| ------------------------------------------- | ------------------------------------------- |
| Session expires during order checkout       | "Your session expired. Please login again." |
| Session expires during payment verification | "Your session expired. Please login again." |
| Session expires fetching orders             | "Your session expired. Please login again." |
| Any other 401 response                      | Same user-friendly message                  |

## Usage Examples

### In Components

```tsx
import { ApiHelper } from "@/lib/api-helper";

// Fetch data
const data = await ApiHelper.json("/products", {
  requireAuth: true,
});

// Make POST request
const response = await ApiHelper.fetch("/orders", {
  method: "POST",
  requireAuth: true,
  body: JSON.stringify(orderData),
});

// Upload file
const uploadData = await ApiHelper.uploadFile("/upload", file, "image");
```

### In Hooks

```tsx
import { useSessionExpiry } from "@/hooks/useSessionExpiry";

export const MyComponent = () => {
  const { showMessage, dismissMessage } = useSessionExpiry();

  // Component has access to session expiry state
};
```

## Benefits

✅ **User-Friendly**: Clear, non-technical error messages instead of "Unauthorized" or "401"  
✅ **Automatic**: No manual logout required, handled automatically  
✅ **Consistent**: Same error handling across all API calls  
✅ **Global**: Single notification visible to user anywhere in app  
✅ **Fast Redirect**: User automatically redirected to login after 2 seconds  
✅ **Centralized**: All 401 logic in one place (ApiHelper.ts)  
✅ **Extensible**: Easy to add more error types or customize behavior

## Future Enhancements

- Add token refresh logic (refresh token approach)
- Store last URL to redirect user back after login
- Add analytics to track session expiry events
- Implement silent logout for multiple tabs
