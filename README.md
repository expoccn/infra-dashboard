# Infra Dashboard

Prompt para o Lovable — Dashboard de Governança de Infraestrutura (otimizado para 5 créditos)

Quero que você crie um frontend MVP de alta fidelidade para um sistema web chamado Dashboard de Governança de Infraestrutura, usando como principal referência visual a imagem conceitual enviada pelo usuário, especialmente o tema dark, o estilo corporativo e a organização dos blocos.

Objetivo

Construir uma única página principal funcional de frontend, com aparência profissional, moderna e responsiva, inspirada na imagem conceitual, mas sem depender de backend real neste momento.

O foco é:

criar a estrutura visual

organizar a experiência do usuário

preparar o frontend para receber dados reais depois

usar dados mockados

gastar o mínimo possível de créditos, evitando escopo desnecessário

Escopo enxuto para economizar créditos

Crie apenas:

1 página principal chamada Visão Executiva

sidebar lateral

header superior

cards de KPI

blocos de resumo e criticidade

2 gráficos

1 tabela de plano de ação

1 painel de origem/completude dos dados

Não criar agora:

autenticação

múltiplas páginas completas

backend real

integrações

formulários complexos

drag and drop

filtros avançados

relatórios exportáveis

IA funcional

CRUD completo

Se quiser, deixe apenas os itens do menu como navegação visual/placeholder.

Identidade visual

Seguir a imagem conceitual enviada como referência principal.

Estilo

tema dark

aparência corporativa premium

visual limpo e elegante

cards com cantos arredondados

contraste forte para boa legibilidade

cores de status bem definidas

estética próxima de dashboard executivo moderno

Branding

usar a logo da Claro no topo esquerdo da sidebar

manter sensação enterprise / telecom / infraestrutura crítica

Paleta sugerida

fundo principal: azul marinho muito escuro / quase preto

cards: tons escuros levemente destacados

texto principal: branco ou cinza muito claro

texto secundário: cinza suave

azul: destaque institucional

verde: dentro da meta

amarelo/laranja: atenção

vermelho: crítico

roxo: preventivas / categorias secundárias

Estrutura da página

Sidebar esquerda

Itens visuais:

Visão Executiva

Energia & PUE

Disponibilidade

Capacidade

Climatização

Diesel

Racks

Plano de Ação

Qualidade dos Dados

Relatórios

Análises por IA

Deixe apenas Visão Executiva como página realmente implementada.
Os demais podem ficar como placeholders sem conteúdo real.

Na parte inferior da sidebar, mostrar:

DC RJO-AM

Operações & Governança

Header superior

Exibir:

título: Dashboard de Governança de Infraestrutura

subtítulo: DC RJO-AM | Competência: MAI/2026

selo/indicador: Base D-1

texto: Dados de referência: 22/05/2026 (ontem)

texto: Última carga 06:00

texto auxiliar: Ingestão via CSV diária

barra e percentual de Completude dos dados

seletor visual de competência: MAI/2026

Cards de KPI

Criar uma linha de cards com:

PUE → valor: Sem dado → badge: Pendente

Disponibilidade TI → valor: 99,95% → badge: Dentro da meta

Disponibilidade Concessionária → valor: 100,00% → subtítulo: Meta: 99,98%

Preventivas → valor: 367 / 367 → badge: 100% realizadas

Ativos Críticos → valor: 4 → badge: Acima do limite

Ações Abertas → valor: 7 → badge: Em andamento

Blocos principais

1. Resumo Executivo

Texto mockado:
“No mês de MAI/2026, a disponibilidade da concessionária e as preventivas ficaram dentro da meta. Entretanto, GMGs e um UPS ultrapassaram os limites de redundância. Alguns dados permanecem pendentes e impactam a completude das informações.”

2. Ativos Críticos

Lista:

GMG 2 — 132,2% do limite

GMG 1 — 128,3% do limite

GMG 3 — 127,3% do limite

UPS 902 — 112,2% do limite

3. Atenção

Lista:

Clima 3º andar — 93,2%

Clima 10º andar — 90,0%

4. Dados Pendentes

Lista:

PUE

FCC

Ocupação de racks

Mostrar também:

barra de completude

valor: 82%

Gráficos

Criar com biblioteca simples e visual elegante.

Gráfico 1 — Tendência Mensal

Tipo: line chart
Séries:

Disponibilidade TI (%)

Capacidade Crítica (%)

Preventivas (%)

Meses:

Jan/26

Fev/26

Mar/26

Abr/26

Mai/26

Valores mockados:

Disponibilidade TI: 99,7 / 99,71 / 99,81 / 99,93 / 99,95

Capacidade Crítica: 82,5 / 84,1 / 86,2 / 88,7 / 89,6

Preventivas: 97,2 / 97,2 / 98,1 / 99,2 / 100,0

Gráfico 2 — Capacidade por Família

Tipo: bar chart
Categorias e valores:

GMG: 132,2%

Trafo: 78,4%

UPS: 112,2%

RPP: 64,7%

Clima: 91,3%

Adicionar uma linha de limite recomendável em 100%.

Painel Origem dos Dados

Exibir:

CSV automático — Importação via integração — 18

Lançamento manual — Inserção via formulário — 12

Validação pendente — Aguardando conferência — 6

Total de fontes — 36

Tabela Plano de Ação

Colunas:

Prioridade

Ação

Responsável

Status

Prazo

Linhas:

Alta | Adequar carga da GMG 2 | Carlos Almeida | Em andamento | 30/05/2026

Alta | Adequar carga da GMG 1 | Carlos Almeida | Em andamento | 30/05/2026

Média | Investigar alarme do Clima 3º andar | Juliana Ribeiro | Em andamento | 28/05/2026

Baixa | Enviar ocupação de racks de MAI/2026 | Marcos Silva | Pendente | 05/06/2026

Requisitos de UX/UI

responsivo para desktop e notebook

boa legibilidade

espaçamento consistente

aparência premium

destaque visual para criticidade

ícones simples e coerentes

não exagerar em animações

priorizar leitura e clareza dos dados

Requisitos técnicos

criar com componentes reutilizáveis

usar dados mockados locais

estruturar o código de forma simples e limpa

preparar os componentes para futura integração com API

não implementar backend agora

se necessário, usar arquivos mock simples ou constantes locais

Importante

Quero que o resultado seja um MVP visual forte, muito próximo da imagem conceitual, sem expandir demais o escopo.

O objetivo nesta etapa é:

validar layout

validar hierarquia de informação

validar tema dark

validar estrutura para futuro dashboard real

Entrega esperada

Entregar:

a página principal pronta

componentes organizados

dados mockados embutidos

visual coerente com a imagem conceitual

código limpo e fácil de evoluir

Se for necessário simplificar para economizar créditos, priorize:

layout

cards KPI

blocos principais

gráficos

tabela

Evite gastar créditos com recursos secundários.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c338b6b6-3ee3-42bd-974c-0af129184494).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
