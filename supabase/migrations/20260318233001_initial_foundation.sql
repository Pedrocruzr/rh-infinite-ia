-- =========================================================
-- RH Infinite IA - Initial Foundation
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;

-- =========================================================
-- Helper functions
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.credit_wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.set_job_opening_days_open()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'fechada' and new.data_fechamento is not null then
    new.dias_em_aberto := greatest(0, new.data_fechamento - new.data_abertura);
  else
    new.dias_em_aberto := greatest(0, current_date - new.data_abertura);
  end if;

  return new;
end;
$$;

-- =========================================================
-- Core tables
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month')),
  monthly_credits integer not null check (monthly_credits >= 0),
  max_users integer not null default 1 check (max_users >= 1),
  active boolean not null default true,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'inactive'
    check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create table if not exists public.credit_wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  delta integer not null,
  balance_after integer,
  transaction_type text not null
    check (transaction_type in ('subscription_grant', 'topup', 'agent_usage', 'manual_adjustment', 'refund')),
  source_type text,
  source_id text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_id_idx
  on public.credit_transactions(user_id);

create index if not exists credit_transactions_created_at_idx
  on public.credit_transactions(created_at desc);

create table if not exists public.topup_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  credits integer not null check (credits > 0),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  short_description text,
  image_path text,
  required_plan text,
  credit_cost integer not null default 1 check (credit_cost > 0),
  active boolean not null default true,
  model text,
  temperature numeric(3,2) default 0.20,
  prompt_id text,
  input_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agents_category_idx
  on public.agents(category);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'success', 'error')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  input_summary text,
  output_summary text,
  credits_consumed integer not null default 0,
  prompt_version text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_user_id_idx
  on public.agent_runs(user_id);

create index if not exists agent_runs_agent_id_idx
  on public.agent_runs(agent_id);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  agent_run_id uuid references public.agent_runs(id) on delete set null,
  event_type text not null default 'agent_execution',
  credits_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_id_idx
  on public.usage_events(user_id);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  priority text not null default 'normal'
    check (priority in ('baixa', 'normal', 'alta', 'urgente')),
  status text not null default 'aberto'
    check (status in ('aberto', 'em_andamento', 'resolvido', 'fechado')),
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutorial_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_url text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nome_vaga text not null,
  data_abertura date not null,
  data_fechamento date,
  status text not null default 'em_aberto'
    check (status in ('em_aberto', 'pausada', 'fechada')),
  dias_em_aberto integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_openings_fechada_requires_data_fechamento
    check (
      (status <> 'fechada')
      or (status = 'fechada' and data_fechamento is not null)
    )
);

create index if not exists job_openings_user_id_idx
  on public.job_openings(user_id);

create index if not exists job_openings_status_idx
  on public.job_openings(status);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'processed', 'failed')),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Triggers
-- =========================================================

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists trg_credit_wallets_updated_at on public.credit_wallets;
create trigger trg_credit_wallets_updated_at
before update on public.credit_wallets
for each row execute function public.set_updated_at();

drop trigger if exists trg_topup_products_updated_at on public.topup_products;
create trigger trg_topup_products_updated_at
before update on public.topup_products
for each row execute function public.set_updated_at();

drop trigger if exists trg_agents_updated_at on public.agents;
create trigger trg_agents_updated_at
before update on public.agents
for each row execute function public.set_updated_at();

drop trigger if exists trg_support_tickets_updated_at on public.support_tickets;
create trigger trg_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

drop trigger if exists trg_tutorial_videos_updated_at on public.tutorial_videos;
create trigger trg_tutorial_videos_updated_at
before update on public.tutorial_videos
for each row execute function public.set_updated_at();

drop trigger if exists trg_job_openings_updated_at on public.job_openings;
create trigger trg_job_openings_updated_at
before update on public.job_openings
for each row execute function public.set_updated_at();

drop trigger if exists trg_job_openings_set_days_open on public.job_openings;
create trigger trg_job_openings_set_days_open
before insert or update on public.job_openings
for each row execute function public.set_job_opening_days_open();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.agent_runs enable row level security;
alter table public.usage_events enable row level security;
alter table public.support_tickets enable row level security;
alter table public.job_openings enable row level security;
alter table public.agents enable row level security;
alter table public.plans enable row level security;
alter table public.topup_products enable row level security;
alter table public.tutorial_videos enable row level security;
alter table public.webhook_events enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

-- Subscriptions
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

-- Wallets
drop policy if exists "credit_wallets_select_own" on public.credit_wallets;
create policy "credit_wallets_select_own"
on public.credit_wallets
for select
to authenticated
using (auth.uid() = user_id);

-- Credit transactions
drop policy if exists "credit_transactions_select_own" on public.credit_transactions;
create policy "credit_transactions_select_own"
on public.credit_transactions
for select
to authenticated
using (auth.uid() = user_id);

-- Agent runs
drop policy if exists "agent_runs_select_own" on public.agent_runs;
create policy "agent_runs_select_own"
on public.agent_runs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "agent_runs_insert_own" on public.agent_runs;
create policy "agent_runs_insert_own"
on public.agent_runs
for insert
to authenticated
with check (auth.uid() = user_id);

-- Usage events
drop policy if exists "usage_events_select_own" on public.usage_events;
create policy "usage_events_select_own"
on public.usage_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "usage_events_insert_own" on public.usage_events;
create policy "usage_events_insert_own"
on public.usage_events
for insert
to authenticated
with check (auth.uid() = user_id);

-- Support tickets
drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own"
on public.support_tickets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own"
on public.support_tickets
for insert
to authenticated
with check (auth.uid() = user_id);

-- Job openings
drop policy if exists "job_openings_select_own" on public.job_openings;
create policy "job_openings_select_own"
on public.job_openings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "job_openings_insert_own" on public.job_openings;
create policy "job_openings_insert_own"
on public.job_openings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "job_openings_update_own" on public.job_openings;
create policy "job_openings_update_own"
on public.job_openings
for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "job_openings_delete_own" on public.job_openings;
create policy "job_openings_delete_own"
on public.job_openings
for delete
to authenticated
using (auth.uid() = user_id);

-- Public read tables for authenticated users
drop policy if exists "agents_select_authenticated" on public.agents;
create policy "agents_select_authenticated"
on public.agents
for select
to authenticated
using (true);

drop policy if exists "plans_select_authenticated" on public.plans;
create policy "plans_select_authenticated"
on public.plans
for select
to authenticated
using (true);

drop policy if exists "topup_products_select_authenticated" on public.topup_products;
create policy "topup_products_select_authenticated"
on public.topup_products
for select
to authenticated
using (true);

drop policy if exists "tutorial_videos_select_authenticated" on public.tutorial_videos;
create policy "tutorial_videos_select_authenticated"
on public.tutorial_videos
for select
to authenticated
using (true);

-- Webhook events: no client-side policies

-- =========================================================
-- Seed: plans
-- =========================================================

insert into public.plans (
  code, name, description, price_cents, billing_interval, monthly_credits, max_users, active
)
values
  ('essencial', 'Essencial', 'Para começar', 3900, 'month', 20, 1, true),
  ('profissional', 'Profissional', 'Mais popular', 6900, 'month', 50, 1, true),
  ('intensivo', 'Intensivo', 'Para uso frequente', 9900, 'month', 90, 1, true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  billing_interval = excluded.billing_interval,
  monthly_credits = excluded.monthly_credits,
  max_users = excluded.max_users,
  active = excluded.active,
  updated_at = now();

-- =========================================================
-- Seed: top-up products
-- =========================================================

insert into public.topup_products (
  code, name, credits, price_cents, active
)
values
  ('topup_10', 'Recarga 10 créditos', 10, 1200, true),
  ('topup_25', 'Recarga 25 créditos', 25, 2500, true)
on conflict (code) do update
set
  name = excluded.name,
  credits = excluded.credits,
  price_cents = excluded.price_cents,
  active = excluded.active,
  updated_at = now();

-- =========================================================
-- Seed: agents catalog
-- =========================================================

insert into public.agents (
  slug, name, category, short_description, image_path, required_plan, credit_cost, active, model, temperature, prompt_id
)
values
  ('teste-perfil-comportamental', 'Teste de Perfil Comportamental', 'Comportamento', 'Análise comportamental aplicada ao RH.', '/agents/teste-perfil-comportamental.png', null, 2, true, 'gpt-5.4', 0.20, 'teste-perfil-comportamental'),
  ('taxa-aderencia-vaga', 'Taxa de Aderência à Vaga', 'Recrutamento', 'Calcula aderência do candidato à vaga.', '/agents/taxa-aderencia-vaga.png', null, 2, true, 'gpt-5.4', 0.20, 'taxa-aderencia-vaga'),
  ('taxa-produtividade-colaborador', 'Taxa de Produtividade por Colaborador', 'People Analytics', 'Avalia produtividade individual.', '/agents/taxa-produtividade-colaborador.png', null, 2, true, 'gpt-5.4', 0.20, 'taxa-produtividade-colaborador'),
  ('coletor-dados-six-box', 'Coletor de Dados Six Box', 'Performance', 'Coleta insumos para análise Six Box.', '/agents/coletor-dados-six-box.png', null, 1, true, 'gpt-5.4', 0.20, 'coletor-dados-six-box'),
  ('analista-diagnostico-six-box', 'Analista Diagnóstico Six Box', 'Performance', 'Interpreta dados do modelo Six Box.', '/agents/analista-diagnostico-six-box.png', null, 3, true, 'gpt-5.4', 0.20, 'analista-diagnostico-six-box'),
  ('descricao-cargo-competencia', 'Descrição de Cargo por Competência', 'Estruturação RH', 'Gera descrição de cargo orientada por competências.', '/agents/descricao-cargo-competencia.png', null, 2, true, 'gpt-5.4', 0.20, 'descricao-cargo-competencia'),
  ('analista-fit-cultura', 'Analista de Fit Cultural', 'Recrutamento', 'Analisa compatibilidade cultural.', '/agents/analista-fit-cultura.png', null, 3, true, 'gpt-5.4', 0.20, 'analista-fit-cultura'),
  ('mapeamento-competencias', 'Mapeamento de Competências', 'Estruturação RH', 'Mapeia competências por função ou área.', '/agents/mapeamento-competencias.png', null, 2, true, 'gpt-5.4', 0.20, 'mapeamento-competencias'),
  ('mentor-dinamicas', 'Mentor de Dinâmicas', 'Recrutamento', 'Sugere dinâmicas para seleção.', '/agents/mentor-dinamicas.png', null, 2, true, 'gpt-5.4', 0.20, 'mentor-dinamicas'),
  ('entrevistador-automatizado', 'Entrevistador Automatizado', 'Recrutamento', 'Cria roteiros estruturados de entrevista.', '/agents/entrevistador-automatizado.png', null, 2, true, 'gpt-5.4', 0.20, 'entrevistador-automatizado'),
  ('teste-perfil-disc', 'Teste de Perfil DISC', 'Comportamento', 'Análise comportamental com DISC.', '/agents/teste-perfil-disc.png', null, 2, true, 'gpt-5.4', 0.20, 'teste-perfil-disc'),
  ('analista-pdi', 'Analista de PDI', 'Desenvolvimento', 'Estrutura plano de desenvolvimento individual.', '/agents/analista-pdi.png', null, 2, true, 'gpt-5.4', 0.20, 'analista-pdi'),
  ('desligamento-humanizado', 'Desligamento Humanizado', 'Gestão de Pessoas', 'Apoia comunicação e processo de desligamento.', '/agents/desligamento-humanizado.png', null, 2, true, 'gpt-5.4', 0.20, 'desligamento-humanizado'),
  ('onboarding-estrategico', 'Onboarding Estratégico', 'Gestão de Pessoas', 'Cria roteiros de integração.', '/agents/onboarding-estrategico.png', null, 2, true, 'gpt-5.4', 0.20, 'onboarding-estrategico'),
  ('custo-por-contratacao', 'Custo por Contratação', 'People Analytics', 'Calcula custo por contratação.', '/agents/custo-por-contratacao.png', null, 2, true, 'gpt-5.4', 0.20, 'custo-por-contratacao'),
  ('pesquisa-clima-organizacional', 'Pesquisa de Clima Organizacional', 'Engajamento', 'Estrutura pesquisas de clima.', '/agents/pesquisa-clima-organizacional.png', null, 2, true, 'gpt-5.4', 0.20, 'pesquisa-clima-organizacional'),
  ('parecer-tecnico-entrevista', 'Parecer Técnico de Entrevista', 'Recrutamento', 'Gera parecer técnico pós-entrevista.', '/agents/parecer-tecnico-entrevista.png', null, 2, true, 'gpt-5.4', 0.20, 'parecer-tecnico-entrevista')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  short_description = excluded.short_description,
  image_path = excluded.image_path,
  required_plan = excluded.required_plan,
  credit_cost = excluded.credit_cost,
  active = excluded.active,
  model = excluded.model,
  temperature = excluded.temperature,
  prompt_id = excluded.prompt_id,
  updated_at = now();
