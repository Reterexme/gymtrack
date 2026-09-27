const request = require('supertest');
const app = require('../../src/app');
const userStore = require('../../src/models/userStore');
const routineStore = require('../../src/models/routineStore');
const { seedAdmin } = require('../../src/seed');

const ejercicio = { nombre: 'Press banca', series: 4, repeticiones: 8, peso: 70 };

async function registrar(email, nombre = 'Ana López') {
  const res = await request(app).post('/api/auth/register').send({ nombre, email, password: 'Segura123' });
  return res.body;
}

async function loginAdmin() {
  await seedAdmin('admin@gym.com', 'Admin1234');
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@gym.com', password: 'Admin1234' });
  return res.body.token;
}

beforeEach(() => {
  userStore.reset();
  routineStore.reset();
});

describe('Salud y errores generales', () => {
  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('ok');
  });

  test('incluye cabeceras de seguridad', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).not.toContain('https:');
    expect(res.headers['content-security-policy']).toContain("object-src 'none'");
  });

  test('ruta inexistente → 404', async () => {
    expect((await request(app).get('/api/nada')).status).toBe(404);
  });

  test('JSON mal formado → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
  });
});

describe('Registro e inicio de sesión', () => {
  test('registra un usuario con rol "usuario" y devuelve un token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Ana López', email: 'ana@gym.com', password: 'Segura123' });
    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe('usuario');
    expect(res.body.usuario.passwordHash).toBeUndefined();
    expect(res.body.token).toBeDefined();
  });

  test('ignora un intento de registrarse como admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Hacker', email: 'h@gym.com', password: 'Segura123', rol: 'admin' });
    expect(res.body.usuario.rol).toBe('usuario');
  });

  test('rechaza datos inválidos', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'malo' });
    expect(res.status).toBe(400);
    expect(res.body.errores.length).toBeGreaterThan(0);
  });

  test('rechaza correo duplicado', async () => {
    await registrar('ana@gym.com');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Otra Ana', email: 'ANA@gym.com', password: 'Segura123' });
    expect(res.status).toBe(409);
  });

  test('login correcto e incorrecto', async () => {
    await registrar('ana@gym.com');
    const ok = await request(app).post('/api/auth/login').send({ email: 'ana@gym.com', password: 'Segura123' });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeDefined();

    const mal = await request(app).post('/api/auth/login').send({ email: 'ana@gym.com', password: 'Otra1234' });
    expect(mal.status).toBe(401);

    const noExiste = await request(app).post('/api/auth/login').send({ email: 'x@gym.com', password: 'Otra1234' });
    expect(noExiste.body.error).toBe(mal.body.error);
  });

  test('login sin datos → 400', async () => {
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(400);
    expect((await request(app).post('/api/auth/login')).status).toBe(400);
  });

  test('intento de inyección en login no funciona', async () => {
    await registrar('ana@gym.com');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: "ana@gym.com' OR '1'='1", password: "' OR '1'='1" });
    expect(res2.status).toBe(401);
  });

  test('GET /api/auth/me devuelve el perfil', async () => {
    const { token } = await registrar('ana@gym.com');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe('ana@gym.com');
  });

  test('GET /api/auth/me con usuario eliminado → 404', async () => {
    const { token } = await registrar('ana@gym.com');
    userStore.reset();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/auth/me sin token → 401', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });
});

describe('Administración de usuarios (solo admin)', () => {
  test('un usuario normal no puede listar usuarios', async () => {
    const { token } = await registrar('ana@gym.com');
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('el admin lista, cambia rol y elimina usuarios', async () => {
    const adminToken = await loginAdmin();
    const { usuario } = await registrar('ana@gym.com');
    const auth = { Authorization: `Bearer ${adminToken}` };

    const lista = await request(app).get('/api/usuarios').set(auth);
    expect(lista.body.usuarios).toHaveLength(2);

    const cambio = await request(app).patch(`/api/usuarios/${usuario.id}/rol`).set(auth).send({ rol: 'entrenador' });
    expect(cambio.body.usuario.rol).toBe('entrenador');

    expect((await request(app).patch(`/api/usuarios/${usuario.id}/rol`).set(auth).send({ rol: 'dios' })).status).toBe(400);
    expect((await request(app).patch('/api/usuarios/no-existe/rol').set(auth).send({ rol: 'admin' })).status).toBe(404);

    expect((await request(app).delete(`/api/usuarios/${usuario.id}`).set(auth)).status).toBe(204);
    expect((await request(app).delete(`/api/usuarios/${usuario.id}`).set(auth)).status).toBe(404);
  });

  test('el admin no puede cambiar su propio rol ni borrarse', async () => {
    const adminToken = await loginAdmin();
    const admin = userStore.findByEmail('admin@gym.com');
    const auth = { Authorization: `Bearer ${adminToken}` };
    expect((await request(app).patch(`/api/usuarios/${admin.id}/rol`).set(auth).send({ rol: 'usuario' })).status).toBe(400);
    expect((await request(app).delete(`/api/usuarios/${admin.id}`).set(auth)).status).toBe(400);
  });
});

describe('Rutinas y permisos por rol', () => {
  test('un usuario crea y consulta sus rutinas', async () => {
    const { token } = await registrar('ana@gym.com');
    const auth = { Authorization: `Bearer ${token}` };
    const creada = await request(app).post('/api/rutinas').set(auth).send({ nombre: 'Pecho', ejercicios: [ejercicio] });
    expect(creada.status).toBe(201);

    const lista = await request(app).get('/api/rutinas').set(auth);
    expect(lista.body.rutinas).toHaveLength(1);

    const una = await request(app).get(`/api/rutinas/${creada.body.rutina.id}`).set(auth);
    expect(una.body.rutina.nombre).toBe('Pecho');
  });

  test('rechaza rutinas inválidas', async () => {
    const { token } = await registrar('ana@gym.com');
    const res = await request(app)
      .post('/api/rutinas')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: '<script>alert(1)</script>', ejercicios: [] });
    expect(res.status).toBe(400);
  });

  test('un usuario no puede asignar rutinas a otros', async () => {
    const ana = await registrar('ana@gym.com');
    const beto = await registrar('beto@gym.com', 'Beto Ruiz');
    const res = await request(app)
      .post('/api/rutinas')
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ nombre: 'Pierna', ejercicios: [ejercicio], asignadaA: beto.usuario.id });
    expect(res.status).toBe(403);
  });

  test('un entrenador asigna rutinas a un usuario', async () => {
    const adminToken = await loginAdmin();
    const coach = await registrar('coach@gym.com', 'Coach Pérez');
    const ana = await registrar('ana@gym.com');
    await request(app)
      .patch(`/api/usuarios/${coach.usuario.id}/rol`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rol: 'entrenador' });
    const login = await request(app).post('/api/auth/login').send({ email: 'coach@gym.com', password: 'Segura123' });
    const coachAuth = { Authorization: `Bearer ${login.body.token}` };

    const ok = await request(app)
      .post('/api/rutinas')
      .set(coachAuth)
      .send({ nombre: 'Pierna', ejercicios: [ejercicio], asignadaA: ana.usuario.id });
    expect(ok.status).toBe(201);
    expect(ok.body.rutina.asignadaA).toBe(ana.usuario.id);

    const noExiste = await request(app)
      .post('/api/rutinas')
      .set(coachAuth)
      .send({ nombre: 'Pierna', ejercicios: [ejercicio], asignadaA: 'fantasma' });
    expect(noExiste.status).toBe(404);

    const deAna = await request(app).get('/api/rutinas').set('Authorization', `Bearer ${ana.token}`);
    expect(deAna.body.rutinas).toHaveLength(1);
  });

  test('un usuario no ve rutinas ajenas; el admin sí y puede borrarlas', async () => {
    const adminToken = await loginAdmin();
    const ana = await registrar('ana@gym.com');
    const beto = await registrar('beto@gym.com', 'Beto Ruiz');
    const creada = await request(app)
      .post('/api/rutinas')
      .set('Authorization', `Bearer ${ana.token}`)
      .send({ nombre: 'Espalda', ejercicios: [ejercicio] });
    const id = creada.body.rutina.id;

    expect((await request(app).get(`/api/rutinas/${id}`).set('Authorization', `Bearer ${beto.token}`)).status).toBe(403);
    expect((await request(app).get(`/api/rutinas/${id}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(200);
    expect((await request(app).get('/api/rutinas/no-existe').set('Authorization', `Bearer ${adminToken}`)).status).toBe(404);

    const todas = await request(app).get('/api/rutinas').set('Authorization', `Bearer ${adminToken}`);
    expect(todas.body.rutinas).toHaveLength(1);

    expect((await request(app).delete(`/api/rutinas/${id}`).set('Authorization', `Bearer ${ana.token}`)).status).toBe(403);
    expect((await request(app).delete(`/api/rutinas/${id}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(204);
    expect((await request(app).delete(`/api/rutinas/${id}`).set('Authorization', `Bearer ${adminToken}`)).status).toBe(404);
  });
});
