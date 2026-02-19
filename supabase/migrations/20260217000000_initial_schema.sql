-- Initial Schema for Scrapper

-- Profiles table to store user data
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  educational_background jsonb,
  work_experience jsonb,
  skills text[],
  base_cv_url text,
  created_at timestamp with time zone default now()
);

-- Jobs table to store scraped listings
create table jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  description text,
  platform text,
  url text,
  scraped_at timestamp with time zone default now()
);

-- Tailored Documents table to store AI generated CVs/Cover Letters
create table tailored_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- Changed to auth.users for better integration
  job_id uuid references jobs(id),
  title text,
  cv_content text,
  cover_letter_content text,
  status text check (status in ('draft', 'final')) default 'draft',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table jobs enable row level security;
alter table tailored_documents enable row level security;

-- Policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Anyone can view jobs" on jobs for select using (true);
create policy "Users can manage their own tailored docs" on tailored_documents for all using (auth.uid() = user_id);
