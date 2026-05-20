// login.js - Autenticação simples com localStorage
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = this.email.value;
  const password = this.password.value;
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  // Demo credentials
  const validEmail = 'nutricionista@nutrifit.com.br';
  const validPassword = 'senha123';

  if (email === validEmail && password === validPassword) {
    // Salvar sessão no localStorage
    const session = {
      id: 'nutri-' + Date.now(),
      email: email,
      name: 'Nutricionista',
      loggedAt: new Date().toISOString()
    };
    localStorage.setItem('nutrifit_session', JSON.stringify(session));
    localStorage.setItem('nutrifit_token', 'demo-token-' + Date.now());
    
    // Redirecionar para app.html
    window.location.href = 'app.html';
  } else {
    errorEl.textContent = 'Email ou senha incorretos.';
    errorEl.style.display = 'block';
  }
});
