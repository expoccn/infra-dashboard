# Validação — Frontend Claro DC RJO-AM v13

## Base validada

- Frontend base: v12.
- Contrato backend: pacote de parâmetros v13 (workflows 08/09/10/12 + cadastro mestre 35).
- Competência oficial utilizada pelo cadastro atual: JUN/2026.

## Conferência de contrato e parâmetros

Foram conferidos 17 pontos diretamente contra o cadastro mestre v13, sem divergências:

- PUE: meta 1,50 e limite 1,63.
- Concessionária: meta 99,98%.
- Diesel: capacidade 15.000 L.
- UPS: 14 esperadas; mapeamento automático atual somente de UPS 801, 802 e 1001.
- RPP: 8 esperadas; mapeamento automático atual somente de RPP-1 e RPP-2.
- GMG: 4 esperados e estado `VALIDATION_REQUIRED`.
- CAG/CHILER: 1.800 TR nominal e 1.200 TR de limite.
- Racks: 184 + 98 + 350 = 632 posições, nos três ambientes oficiais.
- Disponibilidade INFRA × TI: 179 registros esperados.

Resultado: **17/17 aprovados**.

## Adapter / payload

O adapter real foi executado com fixture equivalente ao schema v13 e validou 31 regras, incluindo:

- PUE oficial e classificação acima do limite;
- UPS 3/14 e 11 sem dados;
- RPP 2/8 e 6 sem dados;
- GMG recebido 4/4, mas sem publicação de utilização/reserva;
- CAG com limite, utilização média/pico e reserva;
- VAC com cobertura parcial e escopo separado de INFRA × TI;
- racks oficiais 632/3 locais;
- pendências e alertas da Visão Executiva;
- cenário manual de racks disponível.

Resultado: **31/31 aprovadas**.

## TypeScript / rotas / imports

- Arquivos TS/TSX transpilados: **97**.
- Erros sintáticos: **0**.
- Imports locais ausentes: **0**.
- Núcleo estrito (`api.ts`, `dashboard.ts`, `dashboardAdapter.ts`): **0 diagnósticos**.
- Oito rotas alteradas typechecked com contrato real do `DashboardPayload`: **0 diagnósticos**.
- Rotas declaradas: **15**.
- Rotas ausentes no `routeTree.gen.ts`: **0**.

## Tailwind / CSS

O `styles.css` foi compilado com o motor Tailwind CSS 4 disponível no ambiente (o import opcional de animações foi removido apenas no teste isolado porque o pacote não está instalado no container de validação).

Resultado: **CSS principal compilável, sem erro de sintaxe**.

## Tema claro e escuro

Foram auditados os tokens usados por cards, superfícies, textos, links, badges, botões, tabelas e formulários.

- Pares de contraste testados: **46**.
- Falhas abaixo de 4,5:1: **0**.
- Menor contraste medido: **4,57:1**.
- Tema claro: aprovado.
- Tema escuro: aprovado.

A validação visual foi ainda repetida em Chromium com uma matriz de componentes contendo:

- KPI PUE crítico;
- cobertura UPS;
- aviso GMG;
- capacidade CAG;
- badges info/ok/warn/crit/pending;
- formulário de racks;
- campos habilitados/desabilitados;
- botão primário;
- tabela de inventário;
- estados sem fonte/VAC.

Ajustes feitos durante esta validação:

- `--critical` do tema escuro elevado para manter legibilidade em badges;
- `--primary-foreground` e `--destructive-foreground` escuros no tema escuro, garantindo contraste dos botões;
- fundos semânticos de badges reduzidos para 8%, mantendo contraste mesmo quando aninhados em `surface`.

## Auditoria de apresentação ao cliente

Nas rotas/componentes/context/hooks:

- ocorrências visíveis de `Redis`: 0;
- `n8n`: 0;
- `webhook`: 0;
- `workflow`: 0;
- `backend`: 0;
- `OpenAI`: 0;
- `2See`: 0.

Nas rotas operacionais/componentes do dashboard:

- cores hardcoded fora do fluxo de autenticação aprovado: **0**.

Login e alteração de senha mantêm deliberadamente a composição visual fixa já aprovada (cartão claro + identidade Claro), enquanto as páginas operacionais seguem os dois temas.

## Regras de negócio validadas no frontend

### UPS
- Mostra 14 esperadas.
- Somente 801/802/1001 aparecem como `Com dados` no cenário atual.
- As outras 11 aparecem como `Sem dados recebidos`, nunca zero.
- Não cria utilização consolidada das 14 a partir das três medidas.

### RPP
- Mostra 8 esperadas e cobertura 2/8.
- Seis faltantes não viram zero.

### GMG
- Mostra 4/4 campos recebidos.
- Preserva as leituras recebidas em 0 kVA.
- Exibe aviso explícito de validação.
- Não publica utilização/reserva oficial.

### PUE
- Usa meta/limite do backend.
- Exibe status oficial e dias acima do limite.
- Gráfico recebe linhas de meta e limite.

### CAG
- Usa 1.800/1.200 TR do cadastro.
- Exibe utilização e reserva do grupo CHILER.
- Mantém por chiller apenas Estado Operacional, Horas em Operação, Carga Média e Máxima.
- Outros grupos de climatização ficam `Sem fonte de carga válida`.

### VAC / Disponibilidade
- VAC mantém cobertura de ativos e de tempo separadas.
- Quantidade esperada de ativos VAC vem do payload, não de valor fixo na tela.
- VAC não é apresentado como o inventário consolidado INFRA × TI.
- Concessionária mostra a meta oficial, mas a medição continua indisponível.

### Racks
- Existentes vêm do cadastro mestre: 184 / 98 / 350.
- Total oficial: 632.
- Somente `Ocupados` é editável.
- `Livres` e `%` são calculados.
- Campo `Ocupados` vazio não é convertido para 0.
- Valores negativos, fracionários ou acima da capacidade são bloqueados.

### Diesel
- Capacidade 15.000 L é exibida como parâmetro.
- Nível e autonomia permanecem `Não disponível` sem fonte.

## Limitação do ambiente

O pacote recebido não contém `node_modules` e o ambiente de validação não possui React/Vite/Recharts/TanStack instalados localmente. Por isso não foi possível executar o `vite build` completo. Isso foi compensado por transpilação de todos os 97 arquivos, typecheck estrito do núcleo, typecheck das rotas alteradas, resolução de imports, execução real do adapter, compilação isolada do Tailwind e smoke visual em Chromium nos dois temas.

O smoke final recomendado após o deploy é abrir as páginas principais em produção e alternar claro/escuro, verificando as respostas reais do endpoint autenticado.
