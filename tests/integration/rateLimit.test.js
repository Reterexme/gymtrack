// Verifica la protección contra fuerza bruta en el login.
const request = require('supertest');

test('bloquea con 429 después de demasiados intentos de login', async () => {
  let app;
  process.env.AUTH_RATE_LIMIT = '3';
  jest.isolateModules(() => {
    app = require('../../src/app');
  });
  const intentos = [];
  for (let i = 0; i < 4; i++) {
    intentos.push((await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'x' })).status);
  }
  expect(intentos).toEqual([401, 401, 401, 429]);
  process.env.AUTH_RATE_LIMIT = '1000';
});
