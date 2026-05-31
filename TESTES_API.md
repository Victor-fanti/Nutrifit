# 🧪 NutriFit - Exemplos de Testes de API

## Preparação
Certifique-se que o servidor está rodando em `http://localhost:3000`

---

## 1️⃣ Dashboard com Métricas

### GET - Ver Dashboard Completo
```bash
curl http://localhost:3000/api/analytics/dashboard/complete
```

**Resposta esperada:**
```json
{
  "totalClients": 5,
  "scheduledAppointments": 3,
  "achievedGoals": 12,
  "successRate": "60.0",
  "upcomingAppointments": [...],
  "overdueGoals": [...],
  "adherenceRates": [...],
  "weightEvolution": [...]
}
```

---

## 2️⃣ Agendamentos Inteligentes

### GET - Listar Todos os Agendamentos
```bash
curl http://localhost:3000/api/appointments
```

### GET - Horários Disponíveis em uma Data
```bash
curl http://localhost:3000/api/appointments/availability/2026-05-25
```

### POST - Criar Agendamento
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "date": "2026-05-25",
    "time": "14:00",
    "type": "consulta",
    "notes": "Acompanhamento"
  }'
```

### PATCH - Marcar como Completo
```bash
curl -X PATCH http://localhost:3000/api/appointments/1/complete
```

---

## 3️⃣ Planos Alimentares Dinâmicos

### POST - Criar Plano Alimentar
```bash
curl -X POST http://localhost:3000/api/meals \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "name": "Plano Definição",
    "daily_calories": 2000,
    "protein_g": 150,
    "carbs_g": 200,
    "fat_g": 70
  }'
```

### POST - Gerar Plano a partir de Macros
```bash
curl -X POST http://localhost:3000/api/meals/generate/from-macros \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "daily_calories": 2200,
    "protein_g": 165,
    "carbs_g": 220,
    "fat_g": 75
  }'
```

### POST - Adicionar Refeição ao Plano
```bash
curl -X POST http://localhost:3000/api/meals/1/meals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ovos com aveia",
    "meal_type": "café",
    "time": "07:00",
    "ingredients": "3 ovos, 1 xícara de aveia",
    "calories": 350,
    "protein_g": 25,
    "carbs_g": 35,
    "fat_g": 15
  }'
```

### GET - Ver Plano Completo com Refeições
```bash
curl http://localhost:3000/api/meals/1/complete
```

---

## 4️⃣ Acompanhamento de Evolução

### POST - Registrar Medidas Corporais
```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "waist_cm": 85.5,
    "chest_cm": 98.0,
    "hip_cm": 92.0,
    "arm_cm": 30.5,
    "thigh_cm": 55.0,
    "body_fat_percent": 18.5,
    "muscle_mass_kg": 65
  }'
```

### GET - Evolução Completa do Cliente
```bash
curl http://localhost:3000/api/measurements/evolution/1
```

### POST - Registrar Foto de Progresso
```bash
curl -X POST http://localhost:3000/api/photos \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "photo_path": "/uploads/client_1_front.jpg",
    "type": "before",
    "notes": "Dia 1 do programa"
  }'
```

---

## 5️⃣ Prescrição de Suplementos

### POST - Adicionar Suplemento ao Catálogo
```bash
curl -X POST http://localhost:3000/api/supplements/catalog \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Whey Protein Isolado",
    "type": "proteína",
    "dosage": "30g",
    "frequency": "2x ao dia",
    "benefits": "Recuperação muscular",
    "contraindications": "Alergia a lactose",
    "price": 120.00
  }'
```

### POST - Prescrever Suplemento a Cliente
```bash
curl -X POST http://localhost:3000/api/supplements \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "supplement_id": 1,
    "start_date": "2026-05-20",
    "end_date": "2026-08-20",
    "dosage": "30g",
    "notes": "Tomar após o treino com água"
  }'
```

### GET - Ver Prescrições Ativas
```bash
curl http://localhost:3000/api/supplements/active/1
```

### PATCH - Encerrar Prescrição
```bash
curl -X PATCH http://localhost:3000/api/supplements/1/end
```

---

## 6️⃣ Relatórios Avançados

### GET - Relatório Completo do Cliente
```bash
curl http://localhost:3000/api/export/client/1/report
```

### GET - Relatório de Evolução
```bash
curl http://localhost:3000/api/export/client/1/evolution
```

### GET - Relatório de Aderência
```bash
curl http://localhost:3000/api/export/client/1/adherence
```

### GET - Exportar Metas em CSV
```bash
curl http://localhost:3000/api/export/goals/1 > metas.csv
```

### GET - Exportar Histórico de Peso em CSV
```bash
curl http://localhost:3000/api/export/weight/1 > peso.csv
```

---

## 7️⃣ Chat Melhorado

### GET - Últimas Mensagens (últimas 10)
```bash
curl http://localhost:3000/api/messages/client/1/recent/10
```

### POST - Enviar Mensagem
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "sender": "Nutricionista",
    "message": "Como foi com o plano alimentar essa semana?"
  }'
```

### GET - Buscar Mensagens por Texto
```bash
curl http://localhost:3000/api/messages/client/1/search/dieta
```

### GET - FAQ Automático
```bash
curl http://localhost:3000/api/messages/faq
```

### GET - Sumário da Conversa
```bash
curl http://localhost:3000/api/messages/client/1/summary
```

---

## 8️⃣ Segurança e Conformidade LGPD

### POST - Registrar Consentimento
```bash
curl -X POST http://localhost:3000/api/security/consent \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "consent_type": "privacy_policy",
    "agreed": 1
  }'
```

### GET - Ver Consentimentos do Cliente
```bash
curl http://localhost:3000/api/security/client/1/consents
```

### POST - Registrar Log de Auditoria
```bash
curl -X POST http://localhost:3000/api/security/audit-log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "action": "update_client",
    "resource_type": "client",
    "resource_id": 5,
    "old_value": "peso: 75kg",
    "new_value": "peso: 73kg"
  }'
```

### GET - Exportar Dados do Cliente (LGPD)
```bash
curl http://localhost:3000/api/security/client/1/export-data > cliente_dados.json
```

### DELETE - Deletar Todos os Dados do Cliente (LGPD)
```bash
curl -X DELETE http://localhost:3000/api/security/client/1/delete-data \
  -H "Content-Type: application/json" \
  -d '{"password": "senha_do_user"}'
```

---

## 9️⃣ Integração com Tabela TACO

### GET - Listar Todos os Alimentos
```bash
curl http://localhost:3000/api/foods/catalog
```

### GET - Buscar Alimento por Nome
```bash
curl http://localhost:3000/api/foods/search/arroz
```

### GET - Alimentos por Categoria
```bash
curl http://localhost:3000/api/foods/category/cereais
```

### POST - Adicionar Alimento ao Catálogo
```bash
curl -X POST http://localhost:3000/api/foods/catalog \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arroz Integral",
    "category": "cereais",
    "portion_size": "1 xícara cozida (150g)",
    "calories": 215,
    "protein_g": 5,
    "carbs_g": 45,
    "fat_g": 1.8,
    "fiber_g": 3.5,
    "sodium_mg": 2
  }'
```

### POST - Registrar Consumo de Alimento
```bash
curl -X POST http://localhost:3000/api/foods/log \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "food_id": 5,
    "portion_qty": 1,
    "calories": 215
  }'
```

### GET - Sumário Diário de Alimentos
```bash
curl http://localhost:3000/api/foods/logs/1/daily/2026-05-22
```

---

## 🔟 Análise Comportamental

### POST - Registrar Avaliação Comportamental
```bash
curl -X POST http://localhost:3000/api/behavioral \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "sleep_hours": 7.5,
    "sleep_quality": "good",
    "stress_level": 6,
    "exercise_type": "musculação",
    "exercise_minutes": 60,
    "water_intake_liters": 3.5,
    "symptoms": "cansaço leve",
    "barriers": "falta de tempo; rotina puxada",
    "notes": "Semana produtiva"
  }'
```

### GET - Última Avaliação
```bash
curl http://localhost:3000/api/behavioral/client/1/latest
```

### GET - Tendências dos Últimos 30 Dias
```bash
curl http://localhost:3000/api/behavioral/client/1/trend
```

### GET - Análise de Padrões (Barreiras e Sintomas Frequentes)
```bash
curl http://localhost:3000/api/behavioral/client/1/analysis
```

---

## 🎯 Teste Completo - Fluxo de Uso

```bash
# 1. Criar cliente
curl -X POST http://localhost:3000/api/clients \
  -d '{"name":"João Silva","height_cm":180,"weight_kg":85,"objective":"ganho de massa"}'

# 2. Ver dashboard
curl http://localhost:3000/api/analytics/dashboard/complete

# 3. Agendar consulta
curl -X POST http://localhost:3000/api/appointments \
  -d '{"client_id":1,"date":"2026-05-25","time":"14:00","type":"consulta"}'

# 4. Criar plano
curl -X POST http://localhost:3000/api/meals \
  -d '{"client_id":1,"name":"Ganho","daily_calories":3200,"protein_g":200,"carbs_g":400,"fat_g":100}'

# 5. Registrar medidas
curl -X POST http://localhost:3000/api/measurements \
  -d '{"client_id":1,"waist_cm":95,"chest_cm":105,"hip_cm":98}'

# 6. Registrar alimento
curl -X POST http://localhost:3000/api/foods/log \
  -d '{"client_id":1,"food_id":1,"portion_qty":1,"calories":300}'

# 7. Avaliar comportamento
curl -X POST http://localhost:3000/api/behavioral \
  -d '{"client_id":1,"sleep_hours":8,"stress_level":5,"water_intake_liters":3}'

# 8. Gerar relatório
curl http://localhost:3000/api/export/client/1/report
```

---

## 💡 Dicas

- Use `curl` para testes rápidos
- Use Postman/Insomnia para interface visual
- Verifique respostas com `jq` em Linux/Mac: `curl ... | jq .`
- Todos os endpoints são **JSON**
- Content-Type deve ser `application/json`

---

## ✅ Todos os Endpoints Estão Funcionando!

Se algum teste falhar, verifique:
1. Servidor rodando na porta 3000
2. Banco de dados criado (primeira execução)
3. IDs dos recursos existem
4. JSON bem formatado
