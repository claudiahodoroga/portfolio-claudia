-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- It creates the table the landing-page form writes to.

create table if not exists public.form_responses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  blockers    text[] not null,
  contact     text
);

-- Only the three answers the form offers are accepted, and contact can't be huge.
alter table public.form_responses
  add constraint blockers_valid check (
    cardinality(blockers) between 1 and 3
    and blockers <@ array['team-momentum','event-shape','docs-processes']
  ),
  add constraint contact_length check (contact is null or char_length(contact) <= 200);

-- Row Level Security: visitors can add a response but can never read, edit or delete any.
alter table public.form_responses enable row level security;

create policy "Visitors can submit the form"
  on public.form_responses
  for insert
  to anon
  with check (true);

-- No select/update/delete policies on purpose. You read responses in the
-- Supabase dashboard (Table Editor), which isn't limited by these rules.
