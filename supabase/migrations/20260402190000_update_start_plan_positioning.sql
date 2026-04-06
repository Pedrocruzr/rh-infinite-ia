update public.plans
set
  name = 'Stacks Infinity',
  description = '1 usuário, 120 créditos mensais, todos os agentes liberados e preço travado por 12 meses.',
  price_cents = 19700,
  billing_interval = 'month',
  monthly_credits = 120,
  max_users = 1,
  active = true,
  updated_at = now()
where code = 'start';
