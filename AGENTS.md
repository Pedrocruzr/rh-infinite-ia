<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Memória do Sistema Stacker

## Painel de Vagas (`src/lib/jobs/MEMORIA_PAINEL_VAGAS.md`)
Tudo o que for alterado ou incluído no Painel de Vagas (vagas em aberto, pausadas ou fechadas, reabertura, criação, exclusão ou edição) DEVE refletir imediata e reativamente em todos os componentes da interface:
1. **Caixas superiores de estatísticas**: Total, Em Aberto, Pausadas, Fechadas.
2. **Gráfico de Tendência de Contratação**: Barras 3D mensais baseadas estritamente em vagas fechadas/contratadas reais (sem valores arbitrários ou fallbacks hardcoded como `Math.max(..., items.length, 3)`).
3. **Gráfico de Vagas por Departamento**: HUD orbital e legendas reativas à distribuição real das posições em aberto por área.

## Arquitetura de Produtos e Controle de Acesso (`src/lib/auth/access-control.ts`)
A plataforma opera estritamente com 5 produtos/planos comerciais:

### 1. Stacks Infinity (Sistema Stacker Completo)
- **Cobrança**: Assinatura mensal recorrente de R$ 297/mês (Checkout Asaas: `https://www.asaas.com/c/qmacegbjbnml820m`).
- **Créditos**: 29 créditos mensais renovados a cada ciclo.
- **Acesso**: Irrestrito a toda a plataforma — todos os agentes do catálogo, Painel de Vagas, Painel de Turnover, CLT IA, relatórios e suporte.

### 2. Teste de Perfil Comportamental
- **Cobrança**: Compra de pacote de avaliações (9 créditos de teste de perfil comportamental).
- **Acesso Liberado**:
  - Testes Comportamentais: Teste de Perfil Comportamental (`teste-perfil-comportamental`), DISC (`teste-perfil-disc`) e Big Five (`agente-teste-bigfive`).
  - Relatórios Stackers / Assessments (`/app/recrutador/assessments`).
  - Bônus em PDF/Planilha.
- **Acesso Bloqueado**: Painel de Vagas, Painel de Turnover, CLT IA e todos os agentes fora do escopo comportamental (exibem tela/modal de upgrade).

### 3. Recrutamento & Seleção (6 Meses)
- **Cobrança**:
  - Inicial: Pagamento avulso de R$ 297 válido por 6 meses (Checkout Asaas: `https://www.asaas.com/c/km0ju78t6dknlg59`).
  - Renovação: R$ 197 por mais 6 meses (Checkout Asaas: `https://www.asaas.com/c/ez5sb4gd3enwnyo2`). O e-mail com este link é disparado automaticamente via `sendRenewalExpiredEmail` assim que o período de 6 meses expira.
- **Créditos**: Não há consumo/débito de créditos para os recursos liberados do plano.
- **Preço de Aluno**: Acesso a tabela diferenciada para compra de testes comportamentais adicionais (Start R$ 90,30, Essencial R$ 62,58, Profissional R$ 52,32, Corporativo a partir de R$ 41,30).
- **Acesso Liberado (Estritamente)**:
  1. Painel de Vagas Kanban com métricas e cálculo automático de SLA com IA (`/app/painel-de-vagas`).
  2. Painel de Turnover & Retenção com métricas de rotatividade (`/app/painel-de-turnover`).
  3. CLT IA com pesquisas legislativas ilimitadas (`/app/agentes/clt-ia`).
  4. 8 Agentes Especialistas de Seleção:
     - Taxa de Aderência com a Vaga (`taxa-aderencia-vaga`)
     - Teste de Perfil Comportamental (`teste-perfil-comportamental`)
     - Teste DISC (`teste-perfil-disc`)
     - Teste Big Five (`agente-teste-bigfive`)
     - Entrevistador Automatizado (`entrevistador-automatizado`)
     - Mentor de Dinâmicas (`mentor-dinamicas` / `mentor-de-dinamicas`)
     - Parecer Técnico de Entrevista (`parecer-tecnico-entrevista`)
     - Analista de Custo por Contratação (`custo-contratacao` / `custo-por-contratacao`)
  5. Relatórios Stackers (`/app/recrutador/assessments`), Tutorial, Suporte e Configurações.
- **Acesso Bloqueado**: Todos os demais agentes fora do escopo de recrutamento (Six Box, Pesquisa de Clima, Produtividade, Fit Cultural, Mapeamento de Competências, Onboarding Estratégico, PDI, Desligamento Humanizado) são protegidos com tela e modal de upgrade para o Plano Completo.

### 4. Painel de Vagas (Start, Pro e Personalizado - Acesso Vitalício)
- **Cobrança**:
  - **Plano Start**: R$ 37,00 pagamento único vitalício em até 6x no cartão ou à vista no PIX/Boleto (Checkout Asaas: `https://www.asaas.com/c/v84leqwa2ll7eo66`). Limite de até **10 vagas** cadastradas (ativas, pausadas e fechadas).
  - **Plano Pro**: R$ 67,00 pagamento único vitalício em até 6x no cartão ou à vista no PIX/Boleto (Checkout Asaas: `https://www.asaas.com/c/hlmxju9u0vmme0ca`). Limite de até **25 vagas** cadastradas (ativas, pausadas e fechadas).
  - **Plano Personalizado / Mais Volume**: Para empresas que precisarem de volume superior a 25 vagas, contato direto com o suporte (`suporte@stackercompany.com.br`).
- **Acesso Liberado**:
  - Exclusivamente o **Painel de Vagas Kanban** (`/app/painel-de-vagas`) com métricas e SLA de fechamento inteligente, respeitando a trava de 10 ou 25 vagas conforme o plano contratado. Acesso vitalício sem cobrança de mensalidade.
- **Acesso Bloqueado**:
  - O usuário visualiza as outras funcionalidades na barra lateral e catálogo (Turnover, CLT IA, Robôs de IA), porém travadas — ao clicar, abre a tela/pop-up de upgrade para adquirir o pacote completo ou módulos adicionais.

### 5. Painel de Turnover (Start, Pro e Personalizado - Acesso Vitalício)
- **Cobrança**:
  - **Plano Start**: R$ 37,00 pagamento único vitalício em até 6x no cartão ou à vista no PIX/Boleto (Checkout Asaas: `https://www.asaas.com/c/3twtwlhdwkqnebux`). Limite de até **10 contas ativas e 10 contas de desligamento**.
  - **Plano Pro**: R$ 67,00 pagamento único vitalício em até 6x no cartão ou à vista no PIX/Boleto (Checkout Asaas: `https://www.asaas.com/c/lk191f0wczpnxe9z`). Limite de até **25 contas ativas e 25 contas de desligamento**.
  - **Plano Personalizado / Mais Volume**: Para empresas que precisarem de volume superior a 25 colaboradores/desligamentos, contato direto com o suporte (`suporte@stackercompany.com.br`).
- **Acesso Liberado**:
  - Exclusivamente o **Painel de Turnover & Retenção** (`/app/painel-de-turnover`) com métricas analíticas e cálculo automático de taxas e custos de rotatividade, respeitando os limites contratados. Acesso vitalício sem cobrança de mensalidade.
- **Acesso Bloqueado**:
  - O usuário visualiza as outras funcionalidades na barra lateral e catálogo (Vagas, CLT IA, Robôs de IA), porém travadas — ao clicar, abre a tela/pop-up de upgrade.

### 6. Infraestrutura de E-mail e Disparos Transacionais
- **Remetente Oficial**: `suporte@stackercompany.com.br`
- **Servidor SMTP**: `smtp.suite.uol` (Porta `587`, STARTTLS, com fallback TLS seguro)
- **Credenciais**: Salvas em `.env.local` e nas variáveis de produção da Vercel (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `RESEND_FROM_EMAIL`).


