// ===== APP.JS - Sistema Completo do Nutricionista =====
const API = 'http://localhost:3000/api';
let currentClient = null;
let editMode = false;
let weightChart = null;
let analyticsChart = null;

// ===== TEMA (DARK MODE) =====
function initTheme() {
  const savedTheme = localStorage.getItem('nutrifit_theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  localStorage.setItem('nutrifit_theme', theme);
  const html = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const icon = toggle?.querySelector('.toggle-circle i');
  
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    toggle?.classList.add('dark');
    if (icon) icon.className = 'fas fa-moon';
  } else {
    html.removeAttribute('data-theme');
    toggle?.classList.remove('dark');
    if (icon) icon.className = 'fas fa-sun';
  }
}

document.getElementById('themeToggle')?.addEventListener('click', function() {
  const currentTheme = localStorage.getItem('nutrifit_theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
});

// ===== Verificação de sessão =====
function checkSession() {
  const session = localStorage.getItem('nutrifit_session');
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(session);
  document.getElementById('userEmail').textContent = user.email;
}

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', function() {
  if (confirm('Deseja sair?')) {
    localStorage.removeItem('nutrifit_session');
    localStorage.removeItem('nutrifit_token');
    window.location.href = 'login.html';
  }
});

// ===== API Helper =====
async function api(path, opts = {}) {
  const options = Object.assign({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('nutrifit_token') || ''
    }
  }, opts);
  const res = await fetch(API + path, options);
  if (!res.ok) throw new Error(`Erro ${res.status}: ${await res.text()}`);
  return res.headers.get('content-type')?.includes('json') ? res.json() : res.text();
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `alert alert-${type} alert-dismissible fade show`;
  toast.style.minWidth = '300px';
  toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date)) return value;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function loadClients() {
  const list = document.getElementById('clientsList');
  list.innerHTML = '<div class="text-muted">Carregando clientes...</div>';
  try {
    const clients = await api('/clients');
    if (!clients || clients.length === 0) {
      list.innerHTML = '<div class="text-muted">Nenhum cliente cadastrado.</div>';
      return;
    }
    list.innerHTML = '';
    clients.forEach(c => {
      const item = document.createElement('div');
      item.className = 'client-item';
      item.innerHTML = `
        <div>
          <strong>${c.name}</strong>
          <div class="meta">${c.objective || 'Sem objetivo'} • ${formatDate(c.created_at)}</div>
        </div>
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-primary" data-id="${c.id}">Abrir</button>
          <button class="btn btn-sm btn-outline-danger" data-del="${c.id}">Excluir</button>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    list.innerHTML = '<div class="text-danger">Erro ao carregar clientes.</div>';
    console.error(err);
  }
}

async function createClient(data) {
  await api('/clients', { method: 'POST', body: JSON.stringify(data) });
  document.getElementById('clientForm').reset();
  await loadClients();
}

document.getElementById('clientForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await createClient(data);
  } catch (err) {
    alert('Erro ao criar cliente. Verifique os dados.');
    console.error(err);
  }
});

document.getElementById('clientsList').addEventListener('click', async function (e) {
  const id = e.target.getAttribute('data-id');
  const del = e.target.getAttribute('data-del');
  if (id) return showClient(id);
  if (del) {
    if (confirm('Deseja excluir este cliente?')) {
      await api(`/clients/${del}`, { method: 'DELETE' });
      loadClients();
      hideDetail();
    }
  }
});

async function showClient(id) {
  try {
    const client = await api(`/clients/${id}`);
    currentClient = client;
    renderClientDetail(client);
    toggleEdit(false);
    document.getElementById('clientDetail').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Não foi possível carregar o cliente.');
    console.error(err);
  }
}

async function renderClientDetail(client) {
  document.getElementById('detailName').textContent = client.name;
  document.getElementById('detailMeta').textContent = `${client.sex || 'Sexo não informado'} • Nasc. ${formatDate(client.birthdate)} • Cadastrado em ${formatDate(client.created_at)}`;

  document.getElementById('detailBody').innerHTML = `
    <p><strong>Objetivo:</strong> ${client.objective || 'Não definido'}</p>
    <p><strong>Altura:</strong> ${client.height_cm || '—'} cm • <strong>Peso:</strong> ${client.weight_kg || '—'} kg</p>
    <p><strong>Alergias / restrições:</strong> ${client.allergies || 'Nenhuma informada'}</p>
    <p><strong>Notas:</strong></p>
    <p class="text-muted">${client.notes || 'Sem anotações adicionais.'}</p>
  `;

  const form = document.getElementById('editClientForm');
  form.name.value = client.name || '';
  form.birthdate.value = client.birthdate || '';
  form.sex.value = client.sex || 'M';
  form.height_cm.value = client.height_cm || '';
  form.weight_kg.value = client.weight_kg || '';
  form.objective.value = client.objective || '';
  form.allergies.value = client.allergies || '';
  form.notes.value = client.notes || '';

  await loadGoals(client.id);
  await loadMessages(client.id);
}

function hideDetail() {
  document.getElementById('clientDetail').classList.add('d-none');
  currentClient = null;
  toggleEdit(false);
}

document.getElementById('backToList').addEventListener('click', hideDetail);

document.getElementById('deleteClient').addEventListener('click', async function () {
  if (!currentClient) return;
  if (confirm('Confirmar exclusão do cliente?')) {
    await api(`/clients/${currentClient.id}`, { method: 'DELETE' });
    loadClients();
    hideDetail();
  }
});

document.getElementById('toggleEdit').addEventListener('click', function () {
  toggleEdit(!editMode);
});

document.getElementById('cancelEdit').addEventListener('click', function () {
  toggleEdit(false);
});

function toggleEdit(enable) {
  editMode = enable;
  document.getElementById('editClientSection').classList.toggle('d-none', !enable);
  document.getElementById('toggleEdit').textContent = enable ? 'Fechar' : 'Editar';
}

document.getElementById('editClientForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!currentClient) return;
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api(`/clients/${currentClient.id}`, { method: 'PUT', body: JSON.stringify(data) });
    await showClient(currentClient.id);
    loadClients();
    toggleEdit(false);
  } catch (err) {
    alert('Erro ao salvar alterações.');
    console.error(err);
  }
});

async function loadGoals(clientId) {
  const ul = document.getElementById('goalList');
  ul.innerHTML = '<li class="list-group-item text-muted">Carregando metas...</li>';
  try {
    const goals = await api(`/clients/${clientId}/goals`);
    if (!goals || goals.length === 0) {
      ul.innerHTML = '<li class="list-group-item text-muted">Sem metas registradas.</li>';
      return;
    }
    ul.innerHTML = '';
    goals.forEach(goal => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${goal.title}</strong>
          <div class="small text-muted">${formatDate(goal.target_date)} • ${goal.target_weight ? goal.target_weight + ' kg' : 'Sem peso'}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger" data-goal-id="${goal.id}">Excluir</button>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    ul.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar metas.</li>';
    console.error(err);
  }
}

document.getElementById('goalList').addEventListener('click', async function (e) {
  const goalId = e.target.getAttribute('data-goal-id');
  if (!goalId || !currentClient) return;
  if (confirm('Excluir esta meta?')) {
    await api(`/clients/${currentClient.id}/goals/${goalId}`, { method: 'DELETE' });
    loadGoals(currentClient.id);
  }
});

document.getElementById('goalForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!currentClient) return alert('Abra um cliente para adicionar metas.');
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api(`/clients/${currentClient.id}/goals`, { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    loadGoals(currentClient.id);
  } catch (err) {
    alert('Erro ao adicionar meta.');
    console.error(err);
  }
});

async function loadMessages(clientId) {
  const box = document.getElementById('chatBox');
  box.innerHTML = 'Carregando mensagens...';
  try {
    const msgs = await api(`/clients/${clientId}/messages`);
    box.innerHTML = '';
    if (!msgs || msgs.length === 0) {
      box.innerHTML = '<div class="text-muted">Nenhuma mensagem encontrada.</div>';
      return;
    }
    msgs.forEach(m => {
      const el = document.createElement('div');
      el.className = 'chat-message';
      el.innerHTML = `
        <div class="sender">${m.sender || 'Nutricionista'}</div>
        <div>${m.message}</div>
        <div class="timestamp">${formatDate(m.created_at)}</div>
      `;
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  } catch (err) {
    box.innerHTML = '<div class="text-danger">Erro ao carregar chat.</div>';
    console.error(err);
  }
}

document.getElementById('chatForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!currentClient) return alert('Abra um cliente para enviar mensagens.');
  const data = Object.fromEntries(new FormData(e.target));
  data.sender = 'Nutricionista';
  try {
    await api(`/clients/${currentClient.id}/messages`, { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    loadMessages(currentClient.id);
  } catch (err) {
    alert('Erro ao enviar a mensagem.');
    console.error(err);
  }
});

document.getElementById('calcForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const res = await api('/calculations', { method: 'POST', body: JSON.stringify(data) });
    document.getElementById('calcResult').innerHTML = `IMC: ${res.imc} • TMB: ${res.tmb} kcal • Manutenção estimada: ${res.maintenanceCalories} kcal`;
  } catch (err) {
    alert('Erro na calculadora. Verifique os valores.');
    console.error(err);
  }
});

document.getElementById('exportCsv').addEventListener('click', function () {
  window.location = 'http://localhost:3000/api/export/clients';
});

// Inicializar tema
initTheme();

// Carregar clientes
loadClients();

