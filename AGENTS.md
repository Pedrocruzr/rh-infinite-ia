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

