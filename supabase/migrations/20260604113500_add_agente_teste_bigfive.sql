-- Adiciona o Agente Teste Big Five no catálogo do banco de dados
insert into public.agents (
  slug, name, category, short_description, image_path, required_plan, credit_cost, active, model, temperature, prompt_id
)
values
  ('agente-teste-bigfive', 'Agente Teste Big Five', 'Comportamento', 'Avaliação de personalidade baseada na metodologia Big Five (IPIP-NEO-120).', '/agents/analista-bigfive-light.png', null, 1, true, 'gpt-5.4', 0.20, 'agente-teste-bigfive')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  short_description = excluded.short_description,
  credit_cost = excluded.credit_cost,
  active = excluded.active;
