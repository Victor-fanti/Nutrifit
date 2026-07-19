import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const emptyClient = { name: '', phone: '', objective: '', notes: '' };
const emptyAppointment = { client_id: '', date: '', time: '', type: 'consulta', notes: '' };
const emptyGoal = { client_id: '', title: '', target_weight: '', target_date: '', achieved: 0 };
const emptyMeasurement = { client_id: '', date: '', weight: '', fat_pct: '', waist_cm: '', hip_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '', muscle_kg: '' };

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: 'admin@nutrifit.local', password: 'admin123' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [appointmentError, setAppointmentError] = useState('');
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [goalError, setGoalError] = useState('');
  const [goalLoading, setGoalLoading] = useState(false);
  const [measurementForm, setMeasurementForm] = useState(emptyMeasurement);
  const [measurementError, setMeasurementError] = useState('');
  const [measurementLoading, setMeasurementLoading] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => [
    { label: 'Clientes', value: clients.length, icon: '👥', tone: 'green' },
    { label: 'Consultas', value: appointments.length, icon: '🗓️', tone: 'blue' },
    { label: 'Metas', value: goals.length, icon: '🎯', tone: 'purple' },
    { label: 'Medidas', value: measurements.length, icon: '📏', tone: 'teal' }
  ], [clients.length, appointments, goals.length, measurements.length]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileRes, clientsRes, appointmentsRes, goalsRes, measurementsRes] = await Promise.all([
          axios.get('/api/auth/me'),
          axios.get('/api/clients'),
          axios.get('/api/appointments'),
          axios.get('/api/goals'),
          axios.get('/api/measurements')
        ]);
        setUser(profileRes.data);
        setClients(clientsRes.data);
        setAppointments(appointmentsRes.data);
        setGoals(goalsRes.data);
        setMeasurements(measurementsRes.data);
      } catch (error) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await axios.post('/api/auth/login', loginForm);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Não foi possível entrar');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
    setToken('');
    setUser(null);
    setClients([]);
    setAppointments([]);
    setGoals([]);
    setMeasurements([]);
  };

  const handleCreateClient = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      if (editingClientId) {
        const response = await axios.put(`/api/clients/${editingClientId}`, form);
        setClients((prev) => prev.map((client) => (client.id === editingClientId ? response.data : client)));
        setEditingClientId(null);
      } else {
        const response = await axios.post('/api/clients', form);
        setClients((prev) => [response.data, ...prev]);
      }
      setForm(emptyClient);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Não foi possível salvar o cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClient = (client) => {
    setEditingClientId(client.id);
    setForm({
      name: client.name || '',
      phone: client.phone || '',
      objective: client.objective || '',
      notes: client.notes || ''
    });
    setActiveView('clients');
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await axios.delete(`/api/clients/${clientId}`);
      setClients((prev) => prev.filter((client) => client.id !== clientId));
      setAppointments((prev) => prev.filter((appointment) => appointment.client_id !== clientId));
      setGoals((prev) => prev.filter((goal) => goal.client_id !== clientId));
    } catch (error) {
      setFormError(error.response?.data?.message || 'Não foi possível excluir o cliente');
    }
  };

  const handleCreateAppointment = async (event) => {
    event.preventDefault();
    setAppointmentLoading(true);
    setAppointmentError('');

    try {
      const response = await axios.post('/api/appointments', appointmentForm);
      setAppointments((prev) => [response.data, ...prev]);
      setAppointmentForm(emptyAppointment);
    } catch (error) {
      setAppointmentError(error.response?.data?.message || 'Não foi possível agendar');
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await axios.delete(`/api/appointments/${appointmentId}`);
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== appointmentId));
    } catch (error) {
      setAppointmentError(error.response?.data?.message || 'Não foi possível remover a consulta');
    }
  };

  const handleCreateGoal = async (event) => {
    event.preventDefault();
    setGoalLoading(true);
    setGoalError('');

    try {
      const response = await axios.post('/api/goals', {
        ...goalForm,
        target_weight: goalForm.target_weight === '' ? null : Number(goalForm.target_weight),
        achieved: Number(goalForm.achieved)
      });
      setGoals((prev) => [response.data, ...prev]);
      setGoalForm(emptyGoal);
    } catch (error) {
      setGoalError(error.response?.data?.message || 'Não foi possível salvar a meta');
    } finally {
      setGoalLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await axios.delete(`/api/goals/${goalId}`);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (error) {
      setGoalError(error.response?.data?.message || 'Não foi possível excluir a meta');
    }
  };

  const handleCreateMeasurement = async (event) => {
    event.preventDefault();
    setMeasurementLoading(true);
    setMeasurementError('');

    try {
      const response = await axios.post('/api/measurements', {
        ...measurementForm,
        client_id: measurementForm.client_id ? Number(measurementForm.client_id) : null,
        weight: measurementForm.weight === '' ? null : Number(measurementForm.weight),
        fat_pct: measurementForm.fat_pct === '' ? null : Number(measurementForm.fat_pct),
        waist_cm: measurementForm.waist_cm === '' ? null : Number(measurementForm.waist_cm),
        hip_cm: measurementForm.hip_cm === '' ? null : Number(measurementForm.hip_cm),
        chest_cm: measurementForm.chest_cm === '' ? null : Number(measurementForm.chest_cm),
        arm_cm: measurementForm.arm_cm === '' ? null : Number(measurementForm.arm_cm),
        thigh_cm: measurementForm.thigh_cm === '' ? null : Number(measurementForm.thigh_cm),
        muscle_kg: measurementForm.muscle_kg === '' ? null : Number(measurementForm.muscle_kg)
      });
      setMeasurements((prev) => [response.data, ...prev]);
      setMeasurementForm(emptyMeasurement);
    } catch (error) {
      setMeasurementError(error.response?.data?.message || 'Não foi possível salvar a medida');
    } finally {
      setMeasurementLoading(false);
    }
  };

  const handleDeleteMeasurement = async (measurementId) => {
    try {
      await axios.delete(`/api/measurements/${measurementId}`);
      setMeasurements((prev) => prev.filter((measurement) => measurement.id !== measurementId));
    } catch (error) {
      setMeasurementError(error.response?.data?.message || 'Não foi possível excluir a medida');
    }
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const getClientName = (id) => {
    const client = clients.find((item) => item.id === id);
    return client?.name || 'Cliente';
  };

  return (
    <div className="app-shell">
      <main id="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">Painel NutriFit Pro</div>
            <div className="topbar-subtitle">Gestão nutricional com dashboard, pacientes e consultas</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span className="topbar-search-icon">🔎</span>
              <input placeholder="Buscar" />
            </div>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button className="icon-btn">⚙</button>
          </div>
        </header>

        {!token ? (
          <section className="page active">
            <div className="hero-panel">
              <div className="card hero-card">
                <div>
                  <p className="eyebrow">Acesso seguro</p>
                  <h1>Entre para acessar o painel nutricional</h1>
                  <p>Use o usuário administrador padrão para começar a organizar pacientes, consultas e metas.</p>
                </div>
                <div className="hero-badge">React + Node + SQLite</div>
              </div>
              <div className="card login-card">
                <h3>Login</h3>
                <form onSubmit={handleLogin} className="form-card">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input className="form-control" type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Senha</label>
                    <input className="form-control" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required />
                  </div>
                  {loginError ? <p className="error-text">{loginError}</p> : null}
                  <button type="submit" disabled={loginLoading} className="btn btn-primary">
                    {loginLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        ) : (
          <section className="page active">
            <div className="page-header">
              <div>
                <p className="eyebrow">Painel do nutricionista</p>
                <h2>Bem-vindo, {user?.name || 'nutricionista'}</h2>
                <p>Organize clientes, agendamentos e metas em uma estrutura mais profissional.</p>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout}>Sair</button>
            </div>

            {activeView === 'dashboard' && (
              <>
                <div className="grid-4">
                  {stats.map((stat) => (
                    <div className={`stat-card ${stat.tone}`} key={stat.label}>
                      <div className={`stat-icon ${stat.tone}`}>{stat.icon}</div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid-2">
                  <div className="card">
                    <div className="card-header"><h3>Novo cliente</h3></div>
                    <div className="card-body">
                      <form onSubmit={handleCreateClient} className="form-card">
                        <div className="form-group">
                          <label>Nome</label>
                          <input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Telefone</label>
                            <input className="form-control" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>Objetivo</label>
                            <input className="form-control" value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Observações</label>
                          <textarea className="form-control" rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                        </div>
                        {formError ? <p className="error-text">{formError}</p> : null}
                        <div className="button-row">
                          <button type="submit" disabled={submitting} className="btn btn-primary">
                            {submitting ? 'Salvando...' : 'Salvar cliente'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header"><h3>Agendar consulta</h3></div>
                    <div className="card-body">
                      <form onSubmit={handleCreateAppointment} className="form-card">
                        <div className="form-group">
                          <label>Cliente</label>
                          <select className="form-control" value={appointmentForm.client_id} onChange={(event) => setAppointmentForm({ ...appointmentForm, client_id: event.target.value })} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Data</label>
                            <input className="form-control" type="date" value={appointmentForm.date} onChange={(event) => setAppointmentForm({ ...appointmentForm, date: event.target.value })} required />
                          </div>
                          <div className="form-group">
                            <label>Horário</label>
                            <input className="form-control" type="time" value={appointmentForm.time} onChange={(event) => setAppointmentForm({ ...appointmentForm, time: event.target.value })} required />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Tipo</label>
                          <input className="form-control" value={appointmentForm.type} onChange={(event) => setAppointmentForm({ ...appointmentForm, type: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Observações</label>
                          <textarea className="form-control" rows="3" value={appointmentForm.notes} onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} />
                        </div>
                        {appointmentError ? <p className="error-text">{appointmentError}</p> : null}
                        <button type="submit" disabled={appointmentLoading} className="btn btn-primary">
                          {appointmentLoading ? 'Agendando...' : 'Agendar'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeView === 'clients' && (
              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><h3>{editingClientId ? 'Editar cliente' : 'Novo cliente'}</h3></div>
                  <div className="card-body">
                    <form onSubmit={handleCreateClient} className="form-card">
                      <div className="form-group">
                        <label>Nome</label>
                        <input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Telefone</label>
                          <input className="form-control" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Objetivo</label>
                          <input className="form-control" value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Observações</label>
                        <textarea className="form-control" rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                      </div>
                      {formError ? <p className="error-text">{formError}</p> : null}
                      <div className="button-row">
                        <button type="submit" disabled={submitting} className="btn btn-primary">
                          {submitting ? 'Salvando...' : editingClientId ? 'Atualizar cliente' : 'Salvar cliente'}
                        </button>
                        {editingClientId ? (
                          <button type="button" className="btn btn-ghost" onClick={() => { setEditingClientId(null); setForm(emptyClient); }}>
                            Cancelar
                          </button>
                        ) : null}
                      </div>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h3>Clientes cadastrados</h3></div>
                  <div className="card-body">
                    {clients.length === 0 ? (
                      <p className="empty-state">Nenhum cliente cadastrado ainda.</p>
                    ) : (
                      <ul className="list-stack">
                        {clients.map((client) => (
                          <li key={client.id} className="list-item">
                            <div>
                              <strong>{client.name}</strong>
                              <span>{client.phone || 'Sem telefone'}</span>
                              <small>{client.objective || 'Objetivo não informado'}</small>
                            </div>
                            <div className="action-row">
                              <button type="button" className="btn btn-ghost small" onClick={() => handleEditClient(client)}>Editar</button>
                              <button type="button" className="btn btn-danger small" onClick={() => handleDeleteClient(client.id)}>Excluir</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'appointments' && (
              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><h3>Agendar consulta</h3></div>
                  <div className="card-body">
                    <form onSubmit={handleCreateAppointment} className="form-card">
                      <div className="form-group">
                        <label>Cliente</label>
                        <select className="form-control" value={appointmentForm.client_id} onChange={(event) => setAppointmentForm({ ...appointmentForm, client_id: event.target.value })} required>
                          <option value="">Selecione um cliente</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Data</label>
                          <input className="form-control" type="date" value={appointmentForm.date} onChange={(event) => setAppointmentForm({ ...appointmentForm, date: event.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Horário</label>
                          <input className="form-control" type="time" value={appointmentForm.time} onChange={(event) => setAppointmentForm({ ...appointmentForm, time: event.target.value })} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Tipo</label>
                        <input className="form-control" value={appointmentForm.type} onChange={(event) => setAppointmentForm({ ...appointmentForm, type: event.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Observações</label>
                        <textarea className="form-control" rows="3" value={appointmentForm.notes} onChange={(event) => setAppointmentForm({ ...appointmentForm, notes: event.target.value })} />
                      </div>
                      {appointmentError ? <p className="error-text">{appointmentError}</p> : null}
                      <button type="submit" disabled={appointmentLoading} className="btn btn-primary">
                        {appointmentLoading ? 'Agendando...' : 'Agendar'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h3>Próximas consultas</h3></div>
                  <div className="card-body">
                    {appointments.length === 0 ? (
                      <p className="empty-state">Nenhuma consulta agendada.</p>
                    ) : (
                      <ul className="list-stack">
                        {appointments.map((appointment) => (
                          <li key={appointment.id} className="list-item">
                            <div>
                              <strong>{appointment.type || 'Consulta'}</strong>
                              <span>{appointment.date} às {appointment.time}</span>
                              <small>{appointment.notes || 'Sem observações'}</small>
                            </div>
                            <button type="button" className="btn btn-danger small" onClick={() => handleDeleteAppointment(appointment.id)}>Excluir</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'goals' && (
              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><h3>Nova meta</h3></div>
                  <div className="card-body">
                    <form onSubmit={handleCreateGoal} className="form-card">
                      <div className="form-group">
                        <label>Cliente</label>
                        <select className="form-control" value={goalForm.client_id} onChange={(event) => setGoalForm({ ...goalForm, client_id: event.target.value })} required>
                          <option value="">Selecione um cliente</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Título da meta</label>
                        <input className="form-control" value={goalForm.title} onChange={(event) => setGoalForm({ ...goalForm, title: event.target.value })} required />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Peso alvo (kg)</label>
                          <input className="form-control" type="number" value={goalForm.target_weight} onChange={(event) => setGoalForm({ ...goalForm, target_weight: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Data</label>
                          <input className="form-control" type="date" value={goalForm.target_date} onChange={(event) => setGoalForm({ ...goalForm, target_date: event.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>
                          <input type="checkbox" checked={Boolean(goalForm.achieved)} onChange={(event) => setGoalForm({ ...goalForm, achieved: event.target.checked ? 1 : 0 })} />
                          {' '}Meta concluída
                        </label>
                      </div>
                      {goalError ? <p className="error-text">{goalError}</p> : null}
                      <button type="submit" disabled={goalLoading} className="btn btn-primary">
                        {goalLoading ? 'Salvando...' : 'Salvar meta'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h3>Metas registradas</h3></div>
                  <div className="card-body">
                    {goals.length === 0 ? (
                      <p className="empty-state">Nenhuma meta registrada.</p>
                    ) : (
                      <ul className="list-stack">
                        {goals.map((goal) => (
                          <li key={goal.id} className="list-item">
                            <div>
                              <strong>{goal.title}</strong>
                              <span>{getClientName(goal.client_id)}</span>
                              <small>{goal.target_date ? `Prazo: ${goal.target_date}` : 'Sem prazo'} · {goal.target_weight ? `${goal.target_weight} kg` : 'Sem peso alvo'}</small>
                            </div>
                            <button type="button" className="btn btn-danger small" onClick={() => handleDeleteGoal(goal.id)}>Excluir</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'measurements' && (
              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><h3>Registrar medidas</h3></div>
                  <div className="card-body">
                    <form onSubmit={handleCreateMeasurement} className="form-card">
                      <div className="form-group">
                        <label>Cliente</label>
                        <select className="form-control" value={measurementForm.client_id} onChange={(event) => setMeasurementForm({ ...measurementForm, client_id: event.target.value })} required>
                          <option value="">Selecione um cliente</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Data</label>
                        <input className="form-control" type="date" value={measurementForm.date} onChange={(event) => setMeasurementForm({ ...measurementForm, date: event.target.value })} />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Peso (kg)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.weight} onChange={(event) => setMeasurementForm({ ...measurementForm, weight: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Gordura (%)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.fat_pct} onChange={(event) => setMeasurementForm({ ...measurementForm, fat_pct: event.target.value })} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Quadril (cm)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.hip_cm} onChange={(event) => setMeasurementForm({ ...measurementForm, hip_cm: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Cintura (cm)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.waist_cm} onChange={(event) => setMeasurementForm({ ...measurementForm, waist_cm: event.target.value })} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Peitoral (cm)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.chest_cm} onChange={(event) => setMeasurementForm({ ...measurementForm, chest_cm: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Braço (cm)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.arm_cm} onChange={(event) => setMeasurementForm({ ...measurementForm, arm_cm: event.target.value })} />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Coxa (cm)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.thigh_cm} onChange={(event) => setMeasurementForm({ ...measurementForm, thigh_cm: event.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Músculo (kg)</label>
                          <input className="form-control" type="number" step="0.1" value={measurementForm.muscle_kg} onChange={(event) => setMeasurementForm({ ...measurementForm, muscle_kg: event.target.value })} />
                        </div>
                      </div>
                      {measurementError ? <p className="error-text">{measurementError}</p> : null}
                      <button type="submit" disabled={measurementLoading} className="btn btn-primary">
                        {measurementLoading ? 'Salvando...' : 'Salvar medidas'}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h3>Histórico de medidas</h3></div>
                  <div className="card-body">
                    {measurements.length === 0 ? (
                      <p className="empty-state">Nenhuma medida registrada.</p>
                    ) : (
                      <ul className="list-stack">
                        {measurements.map((measurement) => (
                          <li key={measurement.id} className="list-item">
                            <div>
                              <strong>{getClientName(measurement.client_id)}</strong>
                              <span>{measurement.date || 'Sem data'}</span>
                              <small>{measurement.weight ? `Peso: ${measurement.weight} kg` : 'Peso: —'} · {measurement.fat_pct ? `Gordura: ${measurement.fat_pct}%` : 'Gordura: —'}</small>
                            </div>
                            <button type="button" className="btn btn-danger small" onClick={() => handleDeleteMeasurement(measurement.id)}>Excluir</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <aside id="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🥗</div>
          <div className="sidebar-logo-text">
            <strong>NutriFit Pro</strong>
            <span>Gestão nutricional</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-profile-header">
            <div className="sidebar-user-avatar">{user?.name?.charAt(0) || 'N'}</div>
            <div className="sidebar-user-info">
              <strong>{user?.name || 'Nutricionista'}</strong>
              <span>{user?.email || 'admin@nutrifit.local'}</span>
            </div>
          </div>
          <div className="sidebar-profile-meta">
            <span>● Online</span>
            <span>⚡ Atualizado</span>
          </div>
        </div>

        <div className="sidebar-section-label">Navegação</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}><span className="nav-icon">◉</span> Dashboard</button>
          <button className={`nav-item ${activeView === 'clients' ? 'active' : ''}`} onClick={() => setActiveView('clients')}><span className="nav-icon">◌</span> Pacientes</button>
          <button className={`nav-item ${activeView === 'appointments' ? 'active' : ''}`} onClick={() => setActiveView('appointments')}><span className="nav-icon">◌</span> Consultas</button>
          <button className={`nav-item ${activeView === 'goals' ? 'active' : ''}`} onClick={() => setActiveView('goals')}><span className="nav-icon">◌</span> Metas</button>
          <button className={`nav-item ${activeView === 'measurements' ? 'active' : ''}`} onClick={() => setActiveView('measurements')}><span className="nav-icon">◌</span> Medidas</button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <button className="sidebar-btn" onClick={() => setActiveView('clients')}>＋ Novo</button>
            <button className="sidebar-btn" onClick={() => setActiveView('appointments')}>⏱ Hoje</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
