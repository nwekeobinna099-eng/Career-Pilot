# Scrapper: AI-Powered Job Search & Tailoring System Design

**Date:** 2026-02-16
**Status:** Approved

## Goals
Build a web application that automate finding jobs on major platforms, tailors CVs and Cover Letters to specific job descriptions using AI, ensures ATS friendliness, and tracks the application lifecycle.

## Tech Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS (Premium Aesthetics).
- **Backend/Platform:** Supabase (PostgreSQL, Auth, Storage).
- **Scraping Engine:** Playwright (Node.js/Next.js API Routes).
- **AI Core:** OpenAI GPT-4o API.

## Core Components
1. **Scraper Module:** Searches and extracts jobs from LinkedIn, Indeed, Glassdoor, Irishjobs, and Jobs.ie.
2. **Profile Manager:** Handles PDF CV uploads (AI parsed) and manual data entry (Edu, Work, Skills, etc.).
3. **Tailoring Engine:** Analyzes Job Descriptions vs Profile. Optimizes CV keywords for ATS.
4. **Export Engine:** Generates ATS-friendly PDFs.
5. **Dashboard:** Centralizes job status tracking (To Tailor, Applied, etc.) with direct redirection to application pages.

## Data Flow
1. User searches for jobs -> Scraper finds and stores listings in Supabase.
2. User selects a job -> AI identifies key match criteria.
3. User tailors CV/Cover Letter -> System generates a download bundle.
4. User clicks "Apply" -> Redirects to original job site for submission.
5. User updates status -> Tracking logs the progress.

## Success Criteria
- Successful extraction of data from target platforms despite anti-bot measures.
- AI output that significantly matches job keywords while remaining natural.
- PDF generation that passes simulated ATS checks.
