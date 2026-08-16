# Frontend v6 — autenticação

## Novas rotas

- `/login`
- `/alterar-senha`

## Fluxo

1. Sem sessão: qualquer rota protegida redireciona para `/login`.
2. Login válido: o token fica em `sessionStorage` e é enviado no header `Authorization`.
3. Primeiro acesso do admin: redireciona obrigatoriamente para `/alterar-senha`.
4. Após a troca de senha: a sessão é encerrada e o usuário entra novamente.
5. Logout: revoga a sessão e volta ao login.

## Integração

Endpoints esperados:

- POST `/auth/login`
- GET `/auth/me`
- POST `/auth/logout`
- POST `/auth/change-password`

Base da API permanece configurável por `VITE_DATA_API_BASE_URL`.
