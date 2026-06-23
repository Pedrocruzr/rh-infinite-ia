-- Inserir o novo plano individual perfil_comportamental (R$ 67,90 / 6 créditos)
insert into public.plans (
  code, name, description, price_cents, billing_interval, monthly_credits, max_users, active
)
values (
  'perfil_comportamental',
  'Perfil Comportamental',
  'Acesso exclusivo ao Teste de Perfil Comportamental (3 testes inclusos).',
  6790,
  'month',
  6,
  1,
  true
)
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

-- Inserir o produto de recarga avulsa para o perfil individual (R$ 30,00 / 2 créditos)
insert into public.topup_products (
  code, name, credits, price_cents, expires_in_days, active
)
values (
  'topup_perfil_individual',
  'Recarga Teste Comportamental',
  2,
  3000,
  30,
  true
)
on conflict (code) do update
set
  name = excluded.name,
  credits = excluded.credits,
  price_cents = excluded.price_cents,
  expires_in_days = excluded.expires_in_days,
  active = excluded.active,
  updated_at = now();
