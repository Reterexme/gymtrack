// Almacén de rutinas en memoria.
const { randomUUID } = require('node:crypto');

let routines = [];

function create({ nombre, ejercicios, creadaPor, asignadaA }) {
  const routine = {
    id: randomUUID(),
    nombre: nombre.trim(),
    ejercicios,
    creadaPor,
    asignadaA: asignadaA || creadaPor,
    creadaEn: new Date().toISOString(),
  };
  routines.push(routine);
  return routine;
}

function findById(id) {
  return routines.find((r) => r.id === id) || null;
}

function findByUser(userId) {
  return routines.filter((r) => r.asignadaA === userId || r.creadaPor === userId);
}

function findAll() {
  return [...routines];
}

function remove(id) {
  const before = routines.length;
  routines = routines.filter((r) => r.id !== id);
  return routines.length < before;
}

function reset() {
  routines = [];
}

module.exports = { create, findById, findByUser, findAll, remove, reset };
