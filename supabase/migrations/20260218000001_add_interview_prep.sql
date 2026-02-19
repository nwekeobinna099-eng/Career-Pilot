-- Create interview_prep_kits table
create table if not exists interview_prep_kits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  job_id uuid references jobs(id) on delete cascade not null,
  document_id uuid references tailored_documents(id) on delete cascade not null,
  content jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table interview_prep_kits enable row level security;

-- Policies
create policy "Users can view their own prep kits" on interview_prep_kits for select using (auth.uid() = user_id);
create policy "Users can insert their own prep kits" on interview_prep_kits for insert with check (auth.uid() = user_id);
create policy "Users can delete their own prep kits" on interview_prep_kits for delete using (auth.uid() = user_id);
