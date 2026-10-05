-- Criação da tabela turnover_records para persistência definitiva do Painel de Turnover
-- Permite que todas as inclusões, edições e desligamentos fiquem salvos permanentemente no Supabase

create table if not exists public.turnover_records (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  matricula text not null,
  nome text not null,
  cargo text not null,
  departamento text not null,
  salario numeric(12, 2) not null default 0,
  data_admissao text not null,
  data_desligamento text,
  tipo_desligamento text check (tipo_desligamento is null or tipo_desligamento in ('voluntario', 'involuntario')),
  motivo_especifico text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists turnover_records_user_id_idx
  on public.turnover_records(user_id);

create index if not exists turnover_records_departamento_idx
  on public.turnover_records(departamento);

create index if not exists turnover_records_data_admissao_idx
  on public.turnover_records(data_admissao);

-- Habilita Row Level Security (RLS)
alter table public.turnover_records enable row level security;

-- Políticas de RLS: o usuário só enxerga e manipula os próprios registros
drop policy if exists "turnover_records_select_own" on public.turnover_records;
create policy "turnover_records_select_own"
on public.turnover_records
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "turnover_records_insert_own" on public.turnover_records;
create policy "turnover_records_insert_own"
on public.turnover_records
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "turnover_records_update_own" on public.turnover_records;
create policy "turnover_records_update_own"
on public.turnover_records
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "turnover_records_delete_own" on public.turnover_records;
create policy "turnover_records_delete_own"
on public.turnover_records
for delete
to authenticated
using (auth.uid() = user_id);
