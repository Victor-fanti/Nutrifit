// ===== APP-EXTENDED.JS - Funcionalidades adicionais do NutriFit =====

// ===== 1. ENHANCED DASHBOARD =====
async function loadDashboard() {
  try {
    const dashboard = await api('/analytics/dashboard/complete');
    document.getElementById('dashTotalClients').textContent = dashboard.totalClients || 0;
    document.getElementById('dashScheduledAppointments').textContent = dashboard.scheduledAppointments || 0;
    document.getElementById('dashAchievedGoals').textContent = dashboard.achievedGoals || 0;
    document.getElementById('dashSuccessRate').textContent = (dashboard.successRate || 0) + '%';
    
    // Próximas consultas
    const upcomingList = document.getElementById('upcomingAppointments');
    upcomingList.innerHTML = '';
    if (dashboard.upcomingAppointments && dashboard.upcomingAppointments.length > 0) {
      dashboard.upcomingAppointments.forEach(apt => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
          <strong>${apt.client_name}</strong> - ${apt.date} às ${apt.time}
          <small class="text-muted d-block">${apt.notes || apt.type}</small>
        `;
        upcomingList.appendChild(li);
      });
    } else {
      upcomingList.innerHTML = '<li class="list-group-item text-muted">Nenhuma consulta agendada</li>';
    }
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
  }
}

// ===== 2. APPOINTMENTS CALENDAR =====
async function loadAppointments() {
  const date = document.getElementById('appointmentDate')?.value;
  const status = document.getElementById('appointmentFilter')?.value;
  const list = document.getElementById('appointmentsList');
  
  try {
    let appointments;
    if (date) {
      appointments = await api(`/appointments/range/${date}/${date}`);
    } else {
      appointments = await api('/appointments');
    }
    
    if (status) {
      appointments = appointments.filter(a => a.status === status);
    }
    
    list.innerHTML = '';
    if (!appointments || appointments.length === 0) {
      list.innerHTML = '<li class="list-group-item text-muted">Nenhum agendamento</li>';
      return;
    }
    
    appointments.forEach(apt => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <div class="d-flex justify-content-between">
          <div>
            <strong>${apt.client_name}</strong>
            <div class="small">${apt.date} às ${apt.time} - ${apt.type}</div>
            <small class="text-muted">${apt.notes}</small>
          </div>
          <div>
            <span class="badge bg-${apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'primary'}">${apt.status}</span>
            <button class="btn btn-sm btn-info" onclick="markAppointmentComplete(${apt.id})">Completar</button>
          </div>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    list.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar</li>';
  }
}

async function markAppointmentComplete(id) {
  try {
    await api(`/appointments/${id}/complete`, { method: 'PATCH' });
    showToast('Consulta marcada como completada');
    loadAppointments();
  } catch (err) {
    showToast('Erro ao atualizar consulta', 'danger');
  }
}

// ===== 3. MEAL PLANS =====
async function loadMealPlans() {
  const list = document.getElementById('mealPlansList');
  if (!list) return;
  
  try {
    const list_all = await api('/meals/client/' + (currentClient?.id || 0));
    list.innerHTML = '';
    if (!list_all || list_all.length === 0) {
      list.innerHTML = '<li class="list-group-item text-muted">Nenhum plano cadastrado</li>';
      return;
    }
    
    list_all.forEach(plan => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <strong>${plan.name}</strong>
        <div class="small">
          ${plan.daily_calories} kcal • ${plan.protein_g}g proteína • ${plan.carbs_g}g carbs • ${plan.fat_g}g gordura
        </div>
        <button class="btn btn-sm btn-info mt-2" onclick="viewMealPlan(${plan.id})">Ver refeições</button>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao carregar planos:', err);
  }
}

async function viewMealPlan(planId) {
  try {
    const plan = await api(`/meals/${planId}/complete`);
    alert(`Plano: ${plan.name}\n\nRefeições:\n${plan.meals?.map(m => `${m.name} (${m.meal_type})`).join('\n') || 'Sem refeições'}`);
  } catch (err) {
    showToast('Erro ao carregar plano', 'danger');
  }
}

document.getElementById('createMealPlanForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!currentClient) {
    showToast('Selecione um cliente primeiro', 'warning');
    return;
  }
  
  const data = Object.fromEntries(new FormData(e.target));
  data.client_id = currentClient.id;
  
  try {
    await api('/meals', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showToast('Plano criado com sucesso');
    loadMealPlans();
  } catch (err) {
    showToast('Erro ao criar plano', 'danger');
  }
});

// ===== 4. MEASUREMENTS & EVOLUTION =====
document.getElementById('measurementsForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const clientId = document.getElementById('clientSelect')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  const data = Object.fromEntries(new FormData(e.target));
  data.client_id = parseInt(clientId);
  delete data.clientSelect;
  
  try {
    await api('/measurements', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showToast('Medidas registradas');
    loadEvolution();
  } catch (err) {
    showToast('Erro ao registrar medidas', 'danger');
  }
});

async function loadEvolution() {
  const clientId = document.getElementById('clientSelect')?.value;
  const list = document.getElementById('evolutionList');
  if (!list || !clientId) return;
  
  try {
    const evolution = await api(`/measurements/evolution/${clientId}`);
    list.innerHTML = '';
    
    if (evolution.latestWeight) {
      const li1 = document.createElement('li');
      li1.className = 'list-group-item';
      li1.innerHTML = `<strong>Peso:</strong> ${evolution.latestWeight.weight_kg} kg em ${formatDate(evolution.latestWeight.measured_at)}`;
      list.appendChild(li1);
    }
    
    if (evolution.latestMeasurements) {
      const m = evolution.latestMeasurements;
      const li2 = document.createElement('li');
      li2.className = 'list-group-item';
      li2.innerHTML = `
        <strong>Medidas:</strong>
        <div class="small">
          Cintura: ${m.waist_cm}cm | Peito: ${m.chest_cm}cm | Quadril: ${m.hip_cm}cm<br>
          Braço: ${m.arm_cm}cm | Coxa: ${m.thigh_cm}cm | Gordura: ${m.body_fat_percent}%
        </div>
      `;
      list.appendChild(li2);
    }
    
    if (evolution.photos && evolution.photos.length > 0) {
      const li3 = document.createElement('li');
      li3.className = 'list-group-item';
      li3.innerHTML = `<strong>Fotos:</strong> ${evolution.photos.length} registradas`;
      list.appendChild(li3);
    }
  } catch (err) {
    console.error('Erro ao carregar evolução:', err);
  }
}

// ===== 5. SUPPLEMENTS =====
async function loadSupplements() {
  const selectElem = document.getElementById('supplementSelect');
  if (!selectElem) return;
  
  try {
    const supplements = await api('/supplements/catalog');
    selectElem.innerHTML = '<option value="">Selecione um suplemento</option>';
    supplements.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} - ${s.dosage}`;
      selectElem.appendChild(opt);
    });
  } catch (err) {
    console.error('Erro ao carregar suplementos:', err);
  }
}

document.getElementById('prescribeForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const clientId = document.getElementById('clientSelectSupplement')?.value;
  const supplementId = document.getElementById('supplementSelect')?.value;
  
  if (!clientId || !supplementId) {
    showToast('Selecione cliente e suplemento', 'warning');
    return;
  }
  
  const data = Object.fromEntries(new FormData(e.target));
  data.client_id = parseInt(clientId);
  data.supplement_id = parseInt(supplementId);
  delete data.clientSelectSupplement;
  delete data.supplementSelect;
  
  try {
    await api('/supplements', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showToast('Suplemento prescrito');
    loadPrescriptions();
  } catch (err) {
    showToast('Erro ao prescrever', 'danger');
  }
});

async function loadPrescriptions() {
  const clientId = document.getElementById('clientSelectSupplement')?.value;
  const list = document.getElementById('prescriptionsList');
  if (!list || !clientId) return;
  
  try {
    const prescriptions = await api(`/supplements/client/${clientId}`);
    list.innerHTML = '';
    if (!prescriptions || prescriptions.length === 0) {
      list.innerHTML = '<li class="list-group-item text-muted">Nenhuma prescrição</li>';
      return;
    }
    
    prescriptions.forEach(p => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <strong>${p.supplement_name}</strong> (${p.type})
        <div class="small">${p.dosage} - ${p.start_date} a ${p.end_date || 'Indefinido'}</div>
        <span class="badge bg-${p.status === 'active' ? 'success' : 'secondary'}">${p.status}</span>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao carregar prescrições:', err);
  }
}

// ===== 6. FOODS & TACO =====
async function loadFoods() {
  try {
    const foods = await api('/foods/catalog');
    const select = document.getElementById('foodSelect');
    if (select) {
      select.innerHTML = '<option value="">Selecione o alimento</option>';
      foods.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.name} (${f.portion_size})`;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Erro ao carregar alimentos:', err);
  }
}

document.getElementById('foodSearch')?.addEventListener('keyup', async function() {
  const query = this.value;
  if (query.length < 2) return;
  
  try {
    const foods = await api(`/foods/search/${query}`);
    const select = document.getElementById('foodSelect');
    if (select) {
      select.innerHTML = '<option value="">Selecione o alimento</option>';
      foods.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.name} - ${f.calories} kcal`;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Erro na busca:', err);
  }
});

document.getElementById('logFoodForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const clientId = document.getElementById('clientSelectFood')?.value;
  const foodId = document.getElementById('foodSelect')?.value;
  
  if (!clientId || !foodId) {
    showToast('Selecione cliente e alimento', 'warning');
    return;
  }
  
  const data = Object.fromEntries(new FormData(e.target));
  data.client_id = parseInt(clientId);
  data.food_id = parseInt(foodId);
  delete data.clientSelectFood;
  delete data.foodSelect;
  delete data.foodSearch;
  
  try {
    await api('/foods/log', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showToast('Alimento registrado');
    loadFoodLogs();
  } catch (err) {
    showToast('Erro ao registrar alimento', 'danger');
  }
});

async function loadFoodLogs() {
  const clientId = document.getElementById('clientSelectFood')?.value;
  const date = document.getElementById('foodLogDate')?.value || new Date().toISOString().split('T')[0];
  const list = document.getElementById('foodLogsList');
  
  if (!list || !clientId) return;
  
  try {
    const summary = await api(`/foods/logs/${clientId}/daily/${date}`);
    list.innerHTML = `
      <li class="list-group-item">
        <strong>Total Diário: ${summary.total_calories} kcal</strong>
        <div class="small">P: ${summary.total_protein}g | C: ${summary.total_carbs}g | G: ${summary.total_fat}g</div>
      </li>
    `;
  } catch (err) {
    console.error('Erro ao carregar logs:', err);
  }
}

// ===== 7. BEHAVIORAL ASSESSMENT =====
document.getElementById('behavioralForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const clientId = document.getElementById('clientSelectBehavior')?.value;
  
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  const data = Object.fromEntries(new FormData(e.target));
  data.client_id = parseInt(clientId);
  delete data.clientSelectBehavior;
  
  try {
    await api('/behavioral', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showToast('Avaliação registrada');
    loadBehavioralData();
  } catch (err) {
    showToast('Erro ao registrar avaliação', 'danger');
  }
});

async function loadBehavioralData() {
  const clientId = document.getElementById('clientSelectBehavior')?.value;
  const list = document.getElementById('behavioralList');
  
  if (!list || !clientId) return;
  
  try {
    const latest = await api(`/behavioral/client/${clientId}/latest`);
    if (latest) {
      list.innerHTML = `
        <li class="list-group-item">
          <strong>Última Avaliação:</strong> ${formatDate(latest.created_at)}
          <div class="small">
            Sono: ${latest.sleep_hours}h (${latest.sleep_quality})<br>
            Estresse: ${latest.stress_level}/10<br>
            Exercício: ${latest.exercise_minutes}min (${latest.exercise_type})<br>
            Água: ${latest.water_intake_liters}L
          </div>
        </li>
      `;
    } else {
      list.innerHTML = '<li class="list-group-item text-muted">Nenhuma avaliação</li>';
    }
  } catch (err) {
    console.error('Erro ao carregar dados comportamentais:', err);
  }
}

// ===== 8. REPORTS =====
document.getElementById('reportComprehensive')?.addEventListener('click', async function() {
  const clientId = document.getElementById('clientSelectReport')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  try {
    const report = await api(`/export/client/${clientId}/report`);
    displayReport('Relatório Completo', JSON.stringify(report, null, 2));
  } catch (err) {
    showToast('Erro ao gerar relatório', 'danger');
  }
});

document.getElementById('reportEvolution')?.addEventListener('click', async function() {
  const clientId = document.getElementById('clientSelectReport')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  try {
    const report = await api(`/export/client/${clientId}/evolution`);
    const content = `
      Evolução de ${report.client.name}
      Mudança de Peso: ${report.weightChange} kg
      Registros de Peso: ${report.weight.length}
      Medições: ${report.measurements.length}
    `;
    displayReport('Relatório de Evolução', content);
  } catch (err) {
    showToast('Erro ao gerar relatório', 'danger');
  }
});

document.getElementById('reportAdherence')?.addEventListener('click', async function() {
  const clientId = document.getElementById('clientSelectReport')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  try {
    const report = await api(`/export/client/${clientId}/adherence`);
    const content = `
      Aderência de ${report.client.name}
      Consultas: ${report.appointments.completed_appointments}/${report.appointments.total_appointments}
      Taxa Aderência: ${report.adherenceRate}%
      Metas: ${report.goals.achieved_goals}/${report.goals.total_goals}
      Taxa Sucesso: ${report.successRate}%
    `;
    displayReport('Relatório de Aderência', content);
  } catch (err) {
    showToast('Erro ao gerar relatório', 'danger');
  }
});

function displayReport(title, content) {
  document.getElementById('reportTitle').textContent = title;
  document.getElementById('reportContent').innerHTML = `<pre>${content}</pre>`;
}

document.getElementById('exportGoalsBtn')?.addEventListener('click', function() {
  const clientId = document.getElementById('clientSelectReport')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  window.location = `http://localhost:3000/api/export/goals/${clientId}`;
});

document.getElementById('exportWeightBtn')?.addEventListener('click', function() {
  const clientId = document.getElementById('clientSelectReport')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  window.location = `http://localhost:3000/api/export/weight/${clientId}`;
});

// ===== 9. SECURITY & CONSENT =====
document.getElementById('consentForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const clientId = document.getElementById('clientSelectSecurity')?.value;
  
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  const data = Object.fromEntries(new FormData(e.target));
  data.client_id = parseInt(clientId);
  data.agreed = data.agreed ? 1 : 0;
  delete data.clientSelectSecurity;
  
  try {
    await api('/security/consent', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showToast('Consentimento registrado');
  } catch (err) {
    showToast('Erro ao registrar consentimento', 'danger');
  }
});

document.getElementById('exportClientData')?.addEventListener('click', async function() {
  const clientId = document.getElementById('clientSelectSecurity')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  try {
    const data = await api(`/security/client/${clientId}/export-data`);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cliente_${clientId}_dados.json`;
    a.click();
    showToast('Dados exportados com sucesso');
  } catch (err) {
    showToast('Erro ao exportar dados', 'danger');
  }
});

document.getElementById('deleteClientData')?.addEventListener('click', async function() {
  const clientId = document.getElementById('clientSelectSecurity')?.value;
  if (!clientId) {
    showToast('Selecione um cliente', 'warning');
    return;
  }
  
  if (!confirm('ATENÇÃO: Isso deletará TODOS os dados do cliente permanentemente. Tem certeza?')) {
    return;
  }
  
  try {
    await api(`/security/client/${clientId}/delete-data`, { method: 'DELETE', body: JSON.stringify({}) });
    showToast('Dados do cliente deletados conforme LGPD');
    document.getElementById('clientSelectSecurity').value = '';
  } catch (err) {
    showToast('Erro ao deletar dados', 'danger');
  }
});

// ===== INITIALIZE ON PAGE LOAD =====
function initializeExtended() {
  // Populate client selects
  const selects = ['clientSelect', 'clientSelectSupplement', 'clientSelectFood', 'clientSelectBehavior', 'clientSelectReport', 'clientSelectSecurity'];
  
  async function populateClients() {
    try {
      const clients = await api('/clients');
      selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
          select.innerHTML = '<option value="">Selecione um cliente</option>';
          clients.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            select.appendChild(opt);
          });
        }
      });
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  }
  
  populateClients();
  loadDashboard();
  loadFoods();
  loadSupplements();
  
  // Refresh dashboard every minute
  setInterval(loadDashboard, 60000);
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeExtended);
