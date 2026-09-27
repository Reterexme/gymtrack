const v = require('../../src/utils/validators');

describe('validators', () => {
  test('acepta un correo válido y rechaza inválidos', () => {
    expect(v.isValidEmail('ana@gym.com')).toBe(true);
    expect(v.isValidEmail('sin-arroba.com')).toBe(false);
    expect(v.isValidEmail('<script>@x.com')).toBe(false);
    expect(v.isValidEmail(123)).toBe(false);
    expect(v.isValidEmail('a@b@c.com')).toBe(false);
    expect(v.isValidEmail(`x@${'a'.repeat(120)}.com`)).toBe(false);
  });

  test('valida nombres con letras y acentos', () => {
    expect(v.isValidName('José Pérez')).toBe(true);
    expect(v.isValidName('A')).toBe(false);
    expect(v.isValidName('<b>hack</b>')).toBe(false);
    expect(v.isValidName(null)).toBe(false);
  });

  test('exige contraseñas seguras', () => {
    expect(v.isStrongPassword('Segura123')).toBe(true);
    expect(v.isStrongPassword('corta1')).toBe(false);
    expect(v.isStrongPassword('sinnumeros')).toBe(false);
    expect(v.isStrongPassword('12345678')).toBe(false);
    expect(v.isStrongPassword(undefined)).toBe(false);
  });

  test('validateRegistration devuelve todos los errores', () => {
    expect(v.validateRegistration({ nombre: 'Ana', email: 'ana@gym.com', password: 'Segura123' })).toEqual([]);
    expect(v.validateRegistration({})).toHaveLength(3);
  });

  describe('validateRoutine', () => {
    const ej = { nombre: 'Sentadilla', series: 4, repeticiones: 10, peso: 60 };

    test('acepta una rutina correcta', () => {
      expect(v.validateRoutine({ nombre: 'Pierna', ejercicios: [ej] })).toEqual([]);
    });

    test('rechaza nombre corto, con HTML o sin ejercicios', () => {
      expect(v.validateRoutine({ nombre: 'P', ejercicios: [ej] })).toHaveLength(1);
      expect(v.validateRoutine({ nombre: '<img src=x>', ejercicios: [ej] })).toHaveLength(1);
      expect(v.validateRoutine({ nombre: 'Pierna', ejercicios: [] })).toHaveLength(1);
      expect(v.validateRoutine({ nombre: 'Pierna' })).toHaveLength(1);
    });

    test('rechaza ejercicios con datos inválidos', () => {
      const malos = [
        { ...ej, series: 0 },
        { ...ej, repeticiones: 2.5 },
        { ...ej, peso: -1 },
        { ...ej, nombre: '' },
        { ...ej, nombre: '<x>' },
        null,
      ];
      expect(v.validateRoutine({ nombre: 'Pierna', ejercicios: malos })).toHaveLength(malos.length);
    });
  });
});
