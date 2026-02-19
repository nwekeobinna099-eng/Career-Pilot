# Security & Design Audit Report

**Project:** CareerPilot (Scrapper)  
**Date:** 2026-02-18  
**Auditor:** OpenCode AI

---

## Executive Summary

This report documents the findings from a comprehensive security audit and design review of the CareerPilot application. The application is a Next.js-based job search automation tool that scrapes job listings, tailors CVs using AI, and helps users track applications.

**Critical Vulnerabilities Found:** 5  
**High Severity Issues:** 4  
**Design Flaws:** 5

---

## 🚨 Critical Security Vulnerabilities

### 1. Service Role Key Bypass (CRITICAL)

**Location:** `lib/supabaseClient.ts:10-21`

**Description:**  
The `getSupabaseAdmin()` function uses the `SUPABASE_SERVICE_ROLE_KEY` which completely bypasses Row Level Security (RLS) policies. This grants any code using this client unrestricted access to all data in the database.

**Code:**
```typescript
export const getSupabaseAdmin = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    return createClient(supabaseUrl, serviceKey, { ... })
}
```

**Impact:**
- All API routes using this function can read/write ANY user's data
- Authentication is effectively disabled for these routes
- Used in: `/api/tailor`, `/api/interview-prep`

**Recommendation:** Remove admin client usage and rely on RLS with the regular anon client.

---

### 2. Missing Authentication on API Routes (CRITICAL)

**Location:** All API routes
- `app/api/scrape/route.ts`
- `app/api/tailor/route.ts`
- `app/api/interview-prep/route.ts`
- `app/api/parse-cv/route.ts`

**Description:**  
None of the API endpoints verify that the incoming request is from an authenticated user.

**Impact:**
- Unauthenticated users can trigger expensive operations
- Anyone can access/modify any user's data
- Resource abuse/DoS vulnerability

**Recommendation:** Add Supabase auth verification to every API route:
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

### 3. Insecure Direct Object Reference (IDOR) (CRITICAL)

**Locations:**
- `app/api/tailor/route.ts:13`
- `app/api/interview-prep/route.ts:8`

**Description:**  
APIs accept `profileId` and `jobId` directly from the request body without verifying the authenticated user owns those resources.

**Attack Vector:**
```javascript
// Attacker sends their auth token but specifies victim's profileId
fetch('/api/tailor', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${attackerToken}` },
  body: JSON.stringify({ 
    profileId: "victim-user-id",  // IDOR vulnerability
    jobId: "any-job-id" 
  })
})
```

**Impact:**
- Information disclosure of any user's profile
- Ability to generate tailored documents for any user

**Recommendation:** Always verify that the authenticated user's ID matches the `profileId` in the request.

---

### 4. Server-Side Request Forgery (SSRF) (CRITICAL)

**Location:** `app/api/parse-cv/route.ts:7-14`

**Description:**  
The CV parsing endpoint fetches any URL provided by the client without validation.

**Vulnerable Code:**
```typescript
const { publicUrl } = await req.json()
const fileResponse = await fetch(publicUrl)  // No validation!
```

**Impact:**
- Scan internal network infrastructure
- Access cloud metadata services (AWS: 169.254.169.254)
- Bypass firewalls

**Recommendation:** Validate that URLs:
- Use HTTPS (not HTTP)
- Are from allowed domains only
- Do not point to internal/private IPs

---

### 5. Error Message Information Leakage (HIGH)

**Location:** All API routes

**Description:**  
Error handlers expose full stack traces and internal error messages to clients.

**Examples:**
- `return NextResponse.json({ error: error.message }, { status: 500 })`

**Impact:**  
Attackers learn about:
- Internal file paths
- Library versions
- Database structure
- Network architecture

**Recommendation:** Replace all error messages with generic responses:
```typescript
catch (error) {
    console.error('Internal error:', error) // Log internally
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
}
```

---

## ⚠️ High Severity Issues

### 6. No Rate Limiting

**Description:**  
Scraping endpoints have no rate limiting protection.

**Impact:**
- Server resource exhaustion
- IP bans from Indeed/LinkedIn
- Unexpected API costs (AI services are metered)

**Recommendation:** Implement rate limiting using Upstash Redis or similar.

---

### 7. Client-Only Auth Check

**Location:** `app/dashboard/page.tsx:38-42`

**Description:**
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
    alert('Please sign in to tailor applications.')  // Only client-side!
    return
}
```

**Impact:**  
Client-side checks can be bypassed. The actual protection must happen server-side.

---

### 8. Exposed API Keys in Environment

**Location:** `.env.local`

**Issue:**  
While `.env.local` is gitignored, the values appear to be real keys that are now compromised (found in file history).

**Recommendation:**  
- Rotate all exposed API keys immediately
- Use Supabase's anon key for client-side operations only
- Never expose service role keys to the client

---

### 9. Missing Database Indexes

**Location:** Database schema

**Impact:**  
Queries on `jobs.platform`, `jobs.scraped_at`, and `tailored_documents.user_id` will degrade as data grows.

**Recommendation:** Add indexes:
```sql
CREATE INDEX idx_jobs_platform ON jobs(platform);
CREATE INDEX idx_jobs_scraped_at ON jobs(scraped_at DESC);
CREATE INDEX idx_tailored_docs_user ON tailored_documents(user_id);
```

---

## 🛠️ Design Flaws

### 10. No Pagination

**Location:** `app/dashboard/page.tsx:22-27`

**Code:**
```typescript
const { data } = await supabase
    .from('jobs')
    .select('*, tailored_documents(status)')
    .order('scraped_at', { ascending: false })
```

**Impact:**  
Fetches all jobs - will crash or timeout with large datasets.

**Recommendation:** Implement pagination with `range()` or cursor-based pagination.

---

### 11. No Protected Routes

**Description:**  
Pages like `/dashboard`, `/profile`, `/settings` can be accessed by unauthenticated users (they just show empty states).

**Recommendation:** Add Next.js middleware to redirect unauthenticated users to `/login`.

---

### 12. Hardcoded Configuration

**Description:**  
Default values like location "Dublin" are scattered across files:
- `lib/scraper.ts`
- `app/dashboard/page.tsx`

**Recommendation:** Centralize configuration in a `config.ts` file.

---

### 13. Inconsistent Error Handling

**Description:**  
Some APIs return detailed errors, others return generic messages. No standardized format.

**Recommendation:** Create a unified error handling utility.

---

### 14. No Input Validation

**Description:**  
API routes trust all input without validation (e.g., empty strings, invalid formats).

**Recommendation:** Add Zod schemas for all API inputs.

---

## ✅ Positive Findings

- Clean, modern React/Next.js architecture
- Good use of TypeScript
- Beautiful UI with glass morphism design
- RLS policies defined in schema (but bypassed)
- Separation of concerns (routes, lib, components)
- Environment variables properly configured

---

## Priority Fix List

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | Rotate exposed API keys | Low |
| P0 | Remove getSupabaseAdmin() usage | Medium |
| P0 | Add auth verification to all APIs | Medium |
| P0 | Fix IDOR vulnerabilities | Medium |
| P1 | Sanitize error messages | Low |
| P1 | Add URL validation for parse-cv | Low |
| P1 | Add rate limiting | Medium |
| P1 | Add middleware for protected routes | Low |
| P2 | Add database indexes | Low |
| P2 | Implement pagination | Medium |
| P2 | Centralize configuration | Low |

---

## Conclusion

The application has significant security vulnerabilities that must be addressed before production deployment. The most critical issues are the service role key bypass and missing authentication. Immediate action is required to prevent data breaches and resource abuse.
