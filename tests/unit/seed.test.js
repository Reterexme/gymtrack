const userStore = require('../../src/models/userStore');
const { seedAdmin } = require('../../src/seed');

beforeEach(() => userStore.reset());

test('crea el administrador inicial una sola vez', async () => {
  const admin = await seedAdmin('admin@gym.com', 'Admin1234');
  expect(admin.rol).toBe('admin');
  expect(await seedAdmin('admin@gym.com', 'Admin1234')).toBeNull();
  expect(userStore.findAll()).toHaveLength(1);
});

test('no hace nada sin credenciales', async () => {
  expect(await seedAdmin(undefined, undefined)).toBeNull();
});
