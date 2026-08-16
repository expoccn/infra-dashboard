# Claro RJO-AM — Frontend operacional

Versão baseada no layout visual aprovado, com integração aos dados operacionais e suporte a tema claro/escuro.

## Origem dos dados apresentada ao usuário

- Dados automáticos: WebCTRL via CSV.
- Dados manuais: Racks e Manutenção.
- Indicadores sem fonte homologada permanecem como “Não disponível”.

## Períodos globais

- `d1` = último dia válido disponível.
- `7d` = 7 últimos dias válidos disponíveis.
- `30d` = 30 últimos dias válidos disponíveis.

A seleção é compartilhada por todas as páginas e mantida no navegador.

## Tema

- Tema escuro permanece como padrão inicial.
- O usuário pode alternar para tema claro pelo botão de tema.
- A preferência é persistida no navegador.
- Todos os cards, tabelas, formulários, gráficos, estados de erro/loading e sidebar usam tokens semânticos compatíveis com os dois temas.

## Funcionalidades

- dashboard sem fallback para dados simulados;
- Último dia / 7 dias / 30 dias válidos;
- Racks com leitura, gravação e múltiplos locais;
- Manutenção com leitura e gravação;
- histórico e qualidade dos dados;
- relatório executivo;
- tratamento de loading, indisponibilidade e timeout;
- `0` permanece valor real e `null` permanece indisponível;
- 12 rotas funcionais no menu lateral.

## Configuração de conexão

A URL da fonte de dados pode ser definida no build por:

`VITE_DATA_API_BASE_URL`
