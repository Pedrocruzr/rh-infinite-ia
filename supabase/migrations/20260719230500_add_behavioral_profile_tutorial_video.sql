-- Delete old video if it exists
delete from public.tutorial_videos where youtube_url = 'https://youtu.be/2c6mkHC7mLc';

-- Insert tutorial video for Teste de Perfil Comportamental
insert into public.tutorial_videos (title, description, youtube_url, sort_order, is_published)
values (
  'Como Usar um Agente de IA para Teste de Perfil Comportamental (Tutorial Completo)',
  'Aprenda a configurar, aplicar e interpretar o Teste de Perfil Comportamental (DISC, Eneagrama e Competências) usando o Stacker.',
  'https://youtu.be/_RXztXMsrHg',
  0,
  true
);
