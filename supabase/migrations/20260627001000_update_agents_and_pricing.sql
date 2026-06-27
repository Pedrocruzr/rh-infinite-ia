-- Drop constraint check for positive credit costs to allow 0 (free agents)
alter table public.agents drop constraint if exists agents_credit_cost_check;
alter table public.agents add constraint agents_credit_cost_check check (credit_cost >= 0);

-- Update credit costs for all agents
update public.agents set credit_cost = 3 where slug in ('teste-perfil-comportamental', 'teste-perfil-disc');
update public.agents set credit_cost = 0 where slug in ('coletor-dados-six-box', 'analista-diagnostico-six-box');
update public.agents set credit_cost = 1 where slug in ('taxa-aderencia-vaga', 'entrevistador-automatizado', 'parecer-tecnico-entrevista', 'mentor-dinamicas');
update public.agents set credit_cost = 2 where slug in (
  'descricao-cargo-competencia',
  'mapeamento-competencias',
  'analista-pdi',
  'onboarding-estrategico',
  'desligamento-humanizado',
  'pesquisa-clima-organizacional',
  'custo-por-contratacao',
  'analista-fit-cultura',
  'agente-teste-bigfive'
);

-- Update plans: Start (R$ 297,00 / 29 credits) and Perfil Comportamental (R$ 67,90 / 9 credits for 3 tests)
update public.plans 
   set price_cents = 29700, 
       monthly_credits = 29, 
       description = '1 usuário, 29 créditos mensais, todos os agentes liberados e preço travado por 12 meses.' 
 where code = 'start';

update public.plans 
   set price_cents = 6790, 
       monthly_credits = 9, 
       description = 'Acesso exclusivo ao Teste de Perfil Comportamental (3 testes inclusos).' 
 where code = 'perfil_comportamental';

-- Set old topups inactive
update public.topup_products set active = false;

-- Insert or update standard topup products for Complete plan (Start)
insert into public.topup_products (code, name, credits, price_cents, expires_in_days, active)
values 
  ('topup_essencial', 'Essencial', 10, 10000, 30, true),
  ('topup_profissional', 'Profissional', 20, 19000, 30, true),
  ('topup_intensivo', 'Intensivo', 30, 27000, 30, true)
on conflict (code) do update
set name = excluded.name,
    credits = excluded.credits,
    price_cents = excluded.price_cents,
    expires_in_days = excluded.expires_in_days,
    active = excluded.active,
    updated_at = now();

-- Insert or update individual topup products for Perfil Comportamental plan
insert into public.topup_products (code, name, credits, price_cents, expires_in_days, active)
values 
  ('topup_individual_avulso', 'Avulso', 3, 3000, 30, true),
  ('topup_individual_dupla', 'Dupla', 6, 5800, 30, true),
  ('topup_individual_trio', 'Trio', 9, 8400, 30, true)
on conflict (code) do update
set name = excluded.name,
    credits = excluded.credits,
    price_cents = excluded.price_cents,
    expires_in_days = excluded.expires_in_days,
    active = excluded.active,
    updated_at = now();
