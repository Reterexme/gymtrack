const { notFound, errorHandler } = require('../../src/middleware/errorHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

test('notFound responde 404', () => {
  const res = mockRes();
  notFound({}, res);
  expect(res.status).toHaveBeenCalledWith(404);
});

test('errorHandler oculta detalles internos', () => {
  const res = mockRes();
  errorHandler(new Error('detalle secreto'), {}, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor.' });
});

test('errorHandler registra el error fuera del entorno de pruebas', () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  errorHandler(new Error('x'), {}, mockRes(), jest.fn());
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
  process.env.NODE_ENV = prev;
});
