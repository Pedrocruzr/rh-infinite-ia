alter table if exists public.profile_assessments
  add column if not exists example_4 text,
  add column if not exists agent_name text,
  add column if not exists agent_slug text,
  add column if not exists raw_answers jsonb not null default '{}'::jsonb,
  add column if not exists expires_at timestamptz;

create index if not exists profile_assessments_agent_slug_idx
  on public.profile_assessments (agent_slug);

create index if not exists profile_assessments_expires_at_idx
  on public.profile_assessments (expires_at);
