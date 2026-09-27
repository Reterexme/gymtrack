const userStore = require('../../src/models/userStore');
const routineStore = require('../../src/models/routineStore');

beforeEach(() => {
  userStore.reset();
  routineStore.reset();
});

describe('userStore', () => {
  test('crea, busca, actualiza y elimina usuarios', () => {
    const u = userStore.create({ nombre: ' Ana ', email: 'ANA@gym.com', passwordHash: 'h', rol: 'usuario' });
    expect(u.nombre).toBe('Ana');
    expect(userStore.findByEmail('ana@GYM.com')).toBe(u);
    expect(userStore.findById(u.id)).toBe(u);
    expect(userStore.findAll()).toHaveLength(1);
    expect(userStore.updateRole(u.id, 'entrenador').rol).toBe('entrenador');
    expect(userStore.updateRole('no-existe', 'admin')).toBeNull();
    expect(userStore.remove(u.id)).toBe(true);
    expect(userStore.remove(u.id)).toBe(false);
    expect(userStore.findById(u.id)).toBeNull();
    expect(userStore.findByEmail('ana@gym.com')).toBeNull();
  });

  test('toPublic nunca expone el hash', () => {
    const u = userStore.create({ nombre: 'Ana', email: 'a@b.co', passwordHash: 'secreto', rol: 'usuario' });
    expect(userStore.toPublic(u).passwordHash).toBeUndefined();
  });
});

describe('routineStore', () => {
  test('crea rutinas y filtra por usuario', () => {
    const r1 = routineStore.create({ nombre: 'Pierna', ejercicios: [], creadaPor: 'u1' });
    const r2 = routineStore.create({ nombre: 'Pecho', ejercicios: [], creadaPor: 'coach', asignadaA: 'u2' });
    expect(r1.asignadaA).toBe('u1');
    expect(routineStore.findByUser('u2')).toEqual([r2]);
    expect(routineStore.findByUser('coach')).toEqual([r2]);
    expect(routineStore.findAll()).toHaveLength(2);
    expect(routineStore.findById(r1.id)).toBe(r1);
    expect(routineStore.findById('x')).toBeNull();
    expect(routineStore.remove(r1.id)).toBe(true);
    expect(routineStore.remove(r1.id)).toBe(false);
  });
});
