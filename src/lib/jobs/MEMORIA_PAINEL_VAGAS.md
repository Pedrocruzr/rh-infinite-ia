# MEMÓRIA OFICIAL DO PAINEL DE VAGAS (STACKER)

## Diretriz Fundamental de Integridade e Reatividade
Tudo o que for alterado, reaberto, pausado, fechado, contratado, excluído ou incluído no Painel de Vagas **DEVE refletir de forma imediata, reativa e interligada** em toda a interface do painel, sem dados estáticos, valores hardcoded ou discrepâncias entre os módulos:

1. **Caixas da Parte Superior (Cards de Estatísticas)**:
   - **Total de Vagas**: Soma de todas as posições cadastradas.
   - **Em Aberto**: Apenas vagas com status `"em_aberto"` (ativas para atração/seleção).
   - **Pausadas**: Apenas vagas com status `"pausada"` (congeladas temporariamente).
   - **Fechadas**: Apenas vagas com status `"fechada"` (contratações concluídas).

2. **Gráfico de Barras 3D ("Tendência de Contratação")**:
   - Mede **estritamente as contratações concluídas** (vagas com status `"fechada"`).
   - Quando o usuário **reabre** ou **pausa** uma vaga fechada, ela deixa de ser contratação e a contagem de contratações do mês diminui imediatamente.
   - Quando o usuário **fecha** ou clica em **Contratado**, ela passa a somar nas contratações do mês.
   - **NUNCA** usar contagem total de vagas ou valores mínimos artificiais (ex: `Math.max(closed, items.length, 3)`) no lugar de contratações reais.
   - Meses sem contratações devem registrar `0 contratações`.

3. **Gráfico HUD Orbital 3D ("Vagas por Departamento")**:
   - O núcleo central do círculo reflete as vagas em aberto ativas (`openCount`).
   - Cada anel orbital e cada item da legenda reflete a contagem e porcentagem exata das posições em aberto por área/departamento.
   - Ao **pausar** ou **fechar** uma vaga, a contagem do respectivo departamento diminui no mesmo instante.
   - Ao **reabrir** uma vaga, a contagem do respectivo departamento soma no mesmo instante.
   - Se não houver vagas em aberto, o gráfico exibe 0% e 0 vagas para os departamentos, mantendo total honestidade com o estado do banco.

4. **Quadro Kanban de Vagas (Board)**:
   - Toda alteração por botões de ação ("Reabrir", "Pausar", "Fechar", "Contratado") deve contar com atualização otimista local imediata (`setItems`), proporcionando resposta instantânea ao usuário e sincronização silenciosa no Supabase.
