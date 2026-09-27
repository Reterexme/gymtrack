// Cliente mínimo: usa textContent (no innerHTML) para evitar XSS.
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target));
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const json = await res.json();
  const msg = document.getElementById('mensaje');
  msg.textContent = res.ok ? `Bienvenido, ${json.usuario.nombre} (${json.usuario.rol})` : json.error;
  if (res.ok) sessionStorage.setItem('token', json.token);
});
