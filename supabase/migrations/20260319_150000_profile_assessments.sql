create extension if not exists pgcrypto;

create table if not exists public.profile_assessments (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null default '',
  target_role text not null default '',
  competencies text[] not null default '{}',
  disc_answer text,
  motivation_answer text,
  example_1 text,
  example_2 text,
  example_3 text,
  status text not null default 'in_progress',
  report_status text not null default 'pending',
  report_markdown text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_assessments_created_at_idx
  on public.profile_assessments (created_at desc);

create index if not exists profile_assessments_status_idx
  on public.profile_assessments (status);

create index if not exists profile_assessments_report_status_idx
  on public.profile_assessments (report_status);
