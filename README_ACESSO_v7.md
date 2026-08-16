# Frontend v7 — login aprovado + autenticação

## Workflows de acesso

- `21_CLARO_ACESSO_SETUP_POSTGRES_ADMIN_v1`: executar manualmente uma vez e manter **inativo** depois do setup.
- `22_CLARO_ACESSO_LOGIN_v1`: **ativo**.
- `23_CLARO_ACESSO_ME_v1`: **ativo**.
- `24_CLARO_ACESSO_LOGOUT_v1`: **ativo**.
- `25_CLARO_ACESSO_ALTERAR_SENHA_v1`: **ativo**.
- `26_CLARO_ACESSO_CORS_OPTIONS_v1`: **ativo**.

As versões AUTH dos workflows 12–18 e 20 também devem permanecer ativas. O workflow 19 Health pode permanecer ativo e público.

## Fluxo do frontend

1. Sem sessão: rota protegida redireciona para `/login`.
2. Login válido: token armazenado em `sessionStorage` e enviado no header `Authorization`.
3. Primeiro acesso: se `must_change_password=true`, o usuário vai obrigatoriamente para `/alterar-senha`.
4. Troca de senha encerra a sessão e exige novo login.
5. Logout encerra a sessão e retorna ao login.
6. HTTP 401 em chamadas protegidas encerra a sessão local e redireciona ao login.

## Layout aprovado

- Marca Claro principal à esquerda.
- `Governança de Infraestrutura` e `DC-RJO-AM`.
- Fundo escuro/vermelho com data center/Rio.
- Cartão branco de autenticação à direita.
- Logo CCN Automação discreto e completo no canto inferior esquerdo, sem textos adicionais.
