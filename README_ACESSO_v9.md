# Controle de acesso v9 — Administração de usuários

## Perfis

- `ADMIN`: acesso às telas e administração de usuários; os lançamentos administrativos permanecem protegidos no serviço.
- `VIEWER`: exibido na interface como **Usuário**; acesso de consulta, sem administração de contas.

## Primeiro acesso

Todo usuário criado pelo administrador recebe uma senha provisória individual de 8 caracteres. O serviço grava `must_change_password = true`.

Enquanto esse campo for verdadeiro, o frontend permite somente `/alterar-senha`. Depois da troca, a sessão é encerrada e o usuário deve autenticar novamente.

## Senha definitiva

- mínimo de 8 caracteres;
- máximo de 72 caracteres;
- pelo menos uma letra maiúscula;
- pelo menos um caractere especial.

## Administração

Rota: `/usuarios`, visível somente para `ADMIN`.

Recursos:
- listar usuários;
- criar usuário;
- alterar nome, perfil e status;
- gerar nova senha provisória;
- desativar conta com encerramento das sessões;
- proteção contra auto-desativação/auto-rebaixamento e contra remoção do último administrador ativo.

A senha provisória retornada após criação/reset aparece somente no estado local da página e desaparece ao ocultar, navegar ou recarregar.
