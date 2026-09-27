const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { signToken, authenticate, authorize } = require('../../src/middleware/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('middleware de autenticación', () => {
  const user = { id: 'u1', rol: 'usuario' };

  test('signToken genera un JWT con id y rol', () => {
    const payload = jwt.verify(signToken(user), config.jwtSecret);
    expect(payload.sub).toBe('u1');
    expect(payload.rol).toBe('usuario');
  });

  test('authenticate acepta un token válido', () => {
    const req = { headers: { authorization: `Bearer ${signToken(user)}` } };
    const next = jest.fn();
    authenticate(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'u1', rol: 'usuario' });
  });

  test.each([
    [undefined, 'Token no proporcionado.'],
    ['Basic abc', 'Token no proporcionado.'],
    ['Bearer', 'Token no proporcionado.'],
    ['Bearer token.falso.xyz', 'Token inválido.'],
  ])('authenticate rechaza cabecera %p', (header, msg) => {
    const res = mockRes();
    const next = jest.fn();
    authenticate({ headers: { authorization: header } }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: msg });
  });

  test('authenticate rechaza un token firmado con otra clave', () => {
    const token = jwt.sign({ sub: 'u1', rol: 'admin' }, 'clave-del-atacante');
    const res = mockRes();
    authenticate({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('authenticate rechaza un token sin firma (alg none)', () => {
    const token = jwt.sign({ sub: 'u1', rol: 'admin' }, null, { algorithm: 'none' });
    const res = mockRes();
    authenticate({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('authenticate detecta tokens expirados', () => {
    const token = jwt.sign({ sub: 'u1', rol: 'usuario', exp: Math.floor(Date.now() / 1000) - 10 }, config.jwtSecret);
    const res = mockRes();
    authenticate({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expirado.' });
  });

  test('authorize permite el rol correcto y bloquea los demás', () => {
    const next = jest.fn();
    authorize('admin')({ user: { rol: 'admin' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();

    const res = mockRes();
    authorize('admin')({ user: { rol: 'usuario' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);

    const res2 = mockRes();
    authorize('admin')({}, res2, jest.fn());
    expect(res2.status).toHaveBeenCalledWith(403);
  });
});
