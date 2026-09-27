// Almacén de usuarios en memoria. Se usa para el entorno de prueba;
// en producción se reemplaza por la base de datos sin cambiar los controladores.
const { randomUUID } = require('node:crypto');

let users = [];

function create({ nombre, email, passwordHash, rol }) {
  const user = {
    id: randomUUID(),
    nombre: nombre.trim(),
    email: email.toLowerCase(),
    passwordHash,
    rol,
    creadoEn: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function findByEmail(email) {
  return users.find((u) => u.email === String(email).toLowerCase()) || null;
}

function findById(id) {
  return users.find((u) => u.id === id) || null;
}

function findAll() {
  return [...users];
}

function updateRole(id, rol) {
  const user = findById(id);
  if (!user) return null;
  user.rol = rol;
  return user;
}

function remove(id) {
  const before = users.length;
  users = users.filter((u) => u.id !== id);
  return users.length < before;
}

function reset() {
  users = [];
}

// Nunca se devuelve el hash de la contraseña al cliente.
function toPublic(user) {
  const { id, nombre, email, rol, creadoEn } = user;
  return { id, nombre, email, rol, creadoEn };
}

module.exports = { create, findByEmail, findById, findAll, updateRole, remove, reset, toPublic };
