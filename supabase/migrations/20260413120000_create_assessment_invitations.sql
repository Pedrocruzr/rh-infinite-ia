-- Tabela de convites de avaliação
-- O recrutador gera um link único para o candidato preencher sem precisar de login

create extension if not exists pgcrypto schema extensions;

create table if not exists public.assessment_invitations (
  id          uuid primary key default gen_random_uuid(),
  token       text unique not null default encode(extensions.gen_random_bytes(24), 'hex'),
  recruiter_id uuid not null references auth.users(id) on delete cascade,
  vaga        text not null default '',
  agent_slug  text not null default 'teste-perfil-comportamental',
  status      text not null default 'pending',
  assessment_id uuid references public.profile_assessments(id),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

create index if not exists assessment_invitations_token_idx
  on public.assessment_invitations (token);

create index if not exists assessment_invitations_recruiter_idx
  on public.assessment_invitations (recruiter_id);

alter table public.assessment_invitations enable row level security;

create policy "recruiter_select_own_invitations"
  on public.assessment_invitations for select
  using (auth.uid() = recruiter_id);

create policy "recruiter_insert_own_invitations"
  on public.assessment_invitations for insert
  with check (auth.uid() = recruiter_id);

alter table public.profile_assessments
  add column if not exists recruiter_id uuid references auth.users(id);

create index if not exists profile_assessments_recruiter_idx
  on public.profile_assessments (recruiter_id);
