# Scrapper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a robust Next.js + Supabase web application that scrapes job platforms and generates AI-tailored, ATS-friendly CVs/Cover Letters.

**Architecture:** Next.js App Router for the frontend/API, Supabase for Auth/Database/Storage, and Playwright for the scraping engine. OpenAI GPT-4o will handle the document tailoring logic.

**Tech Stack:** Next.js, Tailwind CSS, Supabase, Playwright, OpenAI SDK, Lucide React.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`
- Test: Build check

**Step 1: Initialize Next.js project**
Run: `npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
Expected: Clean project structure.

**Step 2: Commit**
```bash
git add .
git commit -m "feat: initial project setup"
```

### Task 2: Supabase Integration

**Files:**
- Create: `.env.local`, `lib/supabaseClient.ts`, `database.types.ts`
- Modify: `app/layout.tsx`

**Step 1: Setup Supabase Client**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 2: Create .env.local template**
```bash
echo "NEXT_PUBLIC_SUPABASE_URL=your-project-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" > .env.example
```

**Step 3: Commit**
```bash
git add lib/supabaseClient.ts .env.example
git commit -m "feat: add supabase client and env template"
```

### Task 3: Database Schema Creation

**Files:**
- Create: `supabase/migrations/20260217000000_initial_schema.sql`

**Step 1: Define tables (profiles, jobs, tailored_documents)**
```sql
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  educational_background jsonb,
  work_experience jsonb,
  skills text[],
  base_cv_url text
);

create table jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  description text,
  platform text,
  url text,
  scraped_at timestamp with time zone default now()
);

create table tailored_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  job_id uuid references jobs(id),
  title text,
  cv_content text,
  cover_letter_content text,
  status text check (status in ('draft', 'final')) default 'draft',
  created_at timestamp with time zone default now()
);
```

**Step 2: Apply migration**
(Assuming local Supabase or manual application for now)

**Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add initial database schema"
```

### Task 4: User Profile UI (Manual Entry + PDF Upload)

**Files:**
- Create: `app/profile/page.tsx`, `components/ProfileForm.tsx`, `components/FileUpload.tsx`

**Step 1: Build Profile Form**
Implement a multi-section form for Education, Experience, and Skills.

**Step 2: Build PDF Upload component**
Use Supabase Storage to host the base CV.

**Step 3: Commit**
```bash
git add app/profile/ components/
git commit -m "feat: add profile management UI"
```

### Task 5: Scraping Engine (LinkedIn/Indeed)

**Files:**
- Create: `lib/scraper.ts`, `app/api/scrape/route.ts`

**Step 1: Setup Playwright Scraper Shell**
```typescript
import { chromium } from 'playwright';

export async function scrapeJobs(platform: string, search: string) {
    const browser = await chromium.launch();
    // Implementation for each platform
    await browser.close();
}
```

**Step 2: Implement Indeed Scraper logic**
Focus on title, company, and description extraction.

**Step 3: Commit**
```bash
git add lib/scraper.ts app/api/scrape/
git commit -m "feat: implement initial job scraping logic"
```

### Task 6: AI Tailoring Logic

**Files:**
- Create: `lib/openai.ts`, `app/api/tailor/route.ts`

**Step 1: Setup OpenAI Client**
Integration with models and prompt engineering.

**Step 2: Implement tailoring prompt**
Takes Job Description + Profile -> Returns updated CV content.

**Step 3: Commit**
```bash
git add lib/openai.ts app/api/tailor/
git commit -m "feat: add AI tailoring logic"
```

### Task 7: Dashboard and Job Tracking

**Files:**
- Create: `app/dashboard/page.tsx`, `components/JobCard.tsx`

**Step 1: List jobs from database**
**Step 2: Add status update buttons (Tailor, Apply, Done)**
**Step 3: Implement "Direct Apply" link redirection**

**Step 4: Commit**
```bash
git add app/dashboard/ components/JobCard.tsx
git commit -m "feat: add dashboard for job tracking"
```
