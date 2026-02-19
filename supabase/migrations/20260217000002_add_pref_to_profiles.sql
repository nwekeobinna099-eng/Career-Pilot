-- Add mission preferences to user profiles
alter table profiles add column if not exists smart_match_threshold int default 90;
alter table profiles add column if not exists notification_frequency text default 'Daily Digest';
