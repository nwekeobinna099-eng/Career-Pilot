-- Add notifications table for CareerPilot Alerts
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  type text check (type in ('job', 'system', 'scrape')) default 'system',
  priority text check (priority in ('normal', 'high')) default 'normal',
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Policies
create policy "Users can view their own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Users can delete their own notifications" on notifications for delete using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert with check (auth.uid() = user_id);
