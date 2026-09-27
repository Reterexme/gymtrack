// Respaldo del falso positivo de ZAP "Absence of Anti-CSRF Tokens":
// un formulario HTML de otro sitio (form-urlencoded) no puede iniciar sesión ni crear datos.
const request = require('supertest');
const app = require('../../src/app');

test('el login rechaza envíos de formulario (form-urlencoded)', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .type('form')
    .send({ email: 'ana@gym.com', password: 'Segura123' });
  expect(res.status).toBe(400);
});

test('las rutas protegidas no usan cookies: sin cabecera Authorization → 401', async () => {
  const res = await request(app).post('/api/rutinas').set('Cookie', 'token=cualquiera').send({});
  expect(res.status).toBe(401);
});
