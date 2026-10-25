-- Migration: Adiciona métricas de agilidade de contratação e origem dos candidatos ao Painel de Vagas
-- Totalmente idempotente e seguro para os registros existentes

ALTER TABLE public.job_openings
  ADD COLUMN IF NOT EXISTS data_primeiro_contato date,
  ADD COLUMN IF NOT EXISTS canal_origem text DEFAULT 'LinkedIn';

COMMENT ON COLUMN public.job_openings.data_primeiro_contato IS 'Data do 1º contato com o candidato (alimenta a métrica Time to Hire)';
COMMENT ON COLUMN public.job_openings.canal_origem IS 'Canal de atração/origem da vaga (LinkedIn, Indicação, Gupy, Site de Carreiras, Instagram, Outros)';
