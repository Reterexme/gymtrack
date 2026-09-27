// Validaciones de entrada. Rechazar datos inválidos evita XSS e inyecciones.
// Se valida por partes para evitar expresiones con backtracking excesivo (ReDoS).
const LOCAL_RE = /^[^\s@<>]+$/;
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const NAME_RE = /^[\p{L} .'-]{2,60}$/u;

function isValidEmail(email) {
  if (typeof email !== 'string' || email.length > 100) return false;
  const partes = email.split('@');
  return partes.length === 2 && LOCAL_RE.test(partes[0]) && DOMAIN_RE.test(partes[1]);
}

function isValidName(name) {
  return typeof name === 'string' && NAME_RE.test(name.trim());
}

// Mínimo 8 caracteres, al menos una letra y un número.
function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    password.length <= 72 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

function validateRegistration({ nombre, email, password }) {
  const errors = [];
  if (!isValidName(nombre)) errors.push('Nombre inválido (2 a 60 letras).');
  if (!isValidEmail(email)) errors.push('Correo electrónico inválido.');
  if (!isStrongPassword(password)) {
    errors.push('La contraseña debe tener al menos 8 caracteres, letras y números.');
  }
  return errors;
}

function validateRoutine({ nombre, ejercicios }) {
  const errors = [];
  if (typeof nombre !== 'string' || nombre.trim().length < 3 || nombre.length > 80) {
    errors.push('El nombre de la rutina debe tener entre 3 y 80 caracteres.');
  } else if (/[<>]/.test(nombre)) {
    errors.push('El nombre de la rutina contiene caracteres no permitidos.');
  }
  if (!Array.isArray(ejercicios) || ejercicios.length === 0) {
    errors.push('La rutina debe incluir al menos un ejercicio.');
  } else {
    ejercicios.forEach((e, i) => {
      const ok =
        e &&
        typeof e.nombre === 'string' &&
        e.nombre.trim().length > 0 &&
        !/[<>]/.test(e.nombre) &&
        Number.isInteger(e.series) && e.series > 0 &&
        Number.isInteger(e.repeticiones) && e.repeticiones > 0 &&
        typeof e.peso === 'number' && e.peso >= 0;
      if (!ok) errors.push(`Ejercicio ${i + 1} inválido.`);
    });
  }
  return errors;
}

module.exports = {
  isValidEmail,
  isValidName,
  isStrongPassword,
  validateRegistration,
  validateRoutine,
};
