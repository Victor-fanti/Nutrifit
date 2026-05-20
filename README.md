# NutriFit — Sistema do Nutricionista

Sistema completo para nutricionistas com cadastro de clientes, metas, chat por cliente, calculadora nutricional e exportação de dados.

## Como usar

1. Abra um terminal no diretório `exercicio5`.
2. Instale as dependências:

```powershell
npm install
```

3. Inicie o servidor:

```powershell
npm start
```

4. Abra o arquivo `app.html` no navegador ou sirva a pasta com um servidor estático:

```powershell
npx http-server .
```

5. Acesse `http://localhost:8080/app.html` ou o caminho local do arquivo.

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
- Para usar a exportação CSV, abra o painel e clique em `Exportar CSV`.
