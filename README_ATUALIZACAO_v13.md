# Claro DC RJO-AM — Frontend v13

Base: frontend v12 (PUE/CAG/VAC/Quadros) + contrato do backend de parâmetros v13.

## Principais alterações

- Visão Executiva: metas oficiais, cobertura de inventário e pendências de fonte passam a vir do payload parametrizado.
- Energia & PUE: meta 1,50, limite 1,63, situação do PUE, dias acima do limite, cobertura UPS e aviso de validação GMG.
- Capacidade: inventário esperado completo de UPS/RPP/GMG, limites oficiais, utilização/reserva somente onde há dado válido; CAG/CHILER com capacidade oficial; transformadores/FCC/quadros gerais explícitos como sem fonte válida.
- Climatização: capacidade oficial do grupo CHILER, 9 demais grupos cadastrados sem fonte de carga, VAC separado do inventário INFRA × TI.
- Disponibilidade: VAC atual separado de INFRA × TI; inventário esperado de disponibilidade e meta da concessionária aparecem sem inventar medições.
- Diesel: capacidade oficial do tanque exibida; nível/autonomia continuam indisponíveis sem fonte válida.
- Racks: capacidade oficial de JUN/2026 vem do cadastro; somente `Ocupados` é manual. `Livres` e `%` são calculados. Campo vazio nunca vira zero.
- Qualidade dos Dados: oito fontes automáticas, cobertura de inventário (UPS/RPP/GMG/VAC) e lacunas de fonte explícitas.
- Temas: contraste revisado em claro/escuro, badges semânticos ajustados e botões do tema escuro corrigidos para contraste mínimo.

## Observação sobre Relatórios PDF

A tela `/relatorios` continua exibindo a prévia consolidada. O download PDF não foi conectado nesta versão porque o workflow de PDF existente precisa primeiro ser atualizado para consumir os novos parâmetros oficiais; isso evita oferecer ao cliente um PDF com regra anterior ao cadastro mestre v13.

## Implantação

Substitua o frontend atual por este pacote e mantenha a mesma configuração de ambiente/API já utilizada pela v12. Nenhuma nova variável pública é necessária para as alterações desta versão.
