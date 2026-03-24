insert into public.job_openings (
  user_id,
  nome_vaga,
  data_abertura,
  data_fechamento,
  status,
  dias_em_aberto
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Analista de RH',
  current_date,
  null,
  'em_aberto',
  0
);