# NutriFit — Sistema do Nutricionista

Sistema completo para nutricionistas com cadastro de clientes, metas, chat por cliente, calculadora nutricional e exportação de dados.

## Recursos implementados

- CRUD de clientes
- Edição de dados do cliente
- Metas por cliente com exclusão de metas
- Chat interno por cliente
- Calculadora nutricional (IMC, TMB, calorias de manutenção)
- Exportação de clientes em CSV
- Backend Node/Express com SQLite

## Rotas da API

- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/:id`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/clients/:id/goals`
- `POST /api/clients/:id/goals`
- `DELETE /api/clients/:id/goals/:goalId`
- `GET /api/clients/:id/messages`
- `POST /api/clients/:id/messages`
- `POST /api/calculations`
- `GET /api/export/clients`

## Observações

- Não há autenticação por enquanto.
- O banco de dados SQLite será criado automaticamente em `server/nutrifit.db`.
