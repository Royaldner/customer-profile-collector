# ISSUE: Google OAuth Redirect Not Working

**Status:** In Progress
**Date Identified:** 2026-01-16
**Priority:** High

---

## Problem Description

When users authenticate with Google OAuth (either login or signup), they are redirected incorrectly instead of reaching their intended destination.

### Expected Behavior
- **Google Login** (from `/customer/login`): → `/customer/dashboard`
- **Google Signup** (from `/register`): → `/register` (to complete profile form)

### Actual Behavior
- Both flows redirect to `/customer/login?error=auth_callback_error`
- Or redirect to root URL `/?code=xxx` instead of `/auth/callback`

---

## Root Cause Analysis

### Issue 1: Supabase Ignores `redirectTo` Parameter
Despite setting `redirectTo: /auth/callback?next=...` in the OAuth call, Supabase redirects to the **Site URL** (root `/`) with the auth code.

```javascript
// This redirectTo is being ignored by Supabase
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=/customer/dashboard`,
  },
})
```

**Verified:** Supabase dashboard has correct Redirect URLs configured.

### Issue 2: PKCE Code Verifier Not Accessible Server-Side
When trying to handle the code exchange in middleware or server-side route:
- The PKCE `code_verifier` is stored in the **browser** (localStorage or cookie set by client)
- Server-side middleware cannot access it
- Results in error: `"both auth code and code verifier should be non-empty"`

### Issue 3: Next.js 16 Constraints
- `useSearchParams()` requires Suspense boundary (build error)
- `middleware.ts` is deprecated in favor of `proxy` (warning)

---

## Attempted Solutions

### Attempt 1: Standardize OAuth Redirect URLs
**Commit:** `be92293`

Changed both signup and login to use `/auth/callback` with explicit `next` parameters.

```javascript
// Registration form
redirectTo: `${window.location.origin}/auth/callback?next=/register`

// Login page
redirectTo: `${window.location.origin}/auth/callback?next=/customer/dashboard`
```

**Result:** ❌ Failed - Supabase still redirects to root URL `/?code=xxx`

---

### Attempt 2: Handle Code in Middleware
**Commit:** `4175128`

Added middleware to catch `/?code=xxx` and redirect to `/auth/callback?code=xxx`.

**Result:** ❌ Failed - Redirecting loses the PKCE code verifier context

---

### Attempt 3: Exchange Code in Middleware Directly
**Commit:** `cc0a36e`

Attempted to call `exchangeCodeForSession()` directly in middleware instead of redirecting.

```javascript
// In middleware
const { error } = await supabase.auth.exchangeCodeForSession(code)
```

**Result:** ❌ Failed - Error: `"both auth code and code verifier should be non-empty"`

The code verifier is stored client-side and not accessible in server middleware.

---

### Attempt 4: Client-Side Callback Page
**Commit:** `052caf4` (reverted)

Replaced server route handler with client-side page to access code verifier.

```javascript
// src/app/auth/callback/page.tsx
'use client'
const searchParams = useSearchParams()
const code = searchParams.get('code')
await supabase.auth.exchangeCodeForSession(code)
```

**Result:** ❌ Failed - Build error: `useSearchParams() should be wrapped in a suspense boundary`

**Reverted to:** `71fcdcf`

---

## Next Plan

### Option A: Fix Client-Side Callback (Recommended)

1. **Wrap `useSearchParams()` in Suspense boundary**
   ```javascript
   export default function AuthCallbackPage() {
     return (
       <Suspense fallback={<Loading />}>
         <AuthCallbackContent />
       </Suspense>
     )
   }
   ```

2. **Keep middleware redirect** to `/auth/callback` when code detected at root

3. **Test the full flow** after Suspense fix

### Option B: Configure Supabase Site URL

1. Change Supabase **Site URL** to `/auth/callback` instead of root
2. This would make Supabase redirect directly to callback
3. Risk: May affect other auth flows (email confirmation, password reset)

### Option C: Use Hash-Based Auth Flow

1. Configure Supabase to use **implicit grant** (hash fragments) instead of PKCE
2. Tokens returned in URL hash, no code exchange needed
3. Less secure than PKCE flow

### Option D: Migrate to Next.js Proxy

1. Replace deprecated `middleware.ts` with new `proxy` convention
2. May have different behavior for cookie/code handling
3. Requires research on Next.js 16 proxy patterns

---

## Related Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Main middleware entry point |
| `src/lib/supabase/middleware.ts` | Supabase session handling |
| `src/app/auth/callback/route.ts` | Server-side callback (current) |
| `src/components/forms/customer-form.tsx` | Google signup OAuth call |
| `src/app/customer/login/page.tsx` | Google login OAuth call |

---

## Commits Related to This Issue

| Commit | Description | Status |
|--------|-------------|--------|
| `be92293` | Standardize OAuth redirect URLs | Merged |
| `4175128` | Handle code redirect in middleware | Merged |
| `cc0a36e` | Exchange code in middleware directly | Merged |
| `3803209` | Add debug logging | Merged |
| `052caf4` | Client-side callback page | Reverted |
| `71fcdcf` | Revert client-side callback | Current |

---

## References

- [Supabase Auth with PKCE](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js useSearchParams Suspense](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
- [Next.js Middleware to Proxy Migration](https://nextjs.org/docs/messages/middleware-to-proxy)
