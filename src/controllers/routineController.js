// Rutinas de ejercicio. Muestra los permisos por rol:
// - usuario: crea y ve sus propias rutinas
// - entrenador: además puede asignar rutinas a otros usuarios
// - admin: ve y elimina cualquier rutina
const routineStore = require('../models/routineStore');
const userStore = require('../models/userStore');
const { validateRoutine } = require('../utils/validators');
const { ROLES } = require('../utils/roles');

function create(req, res) {
  const { nombre, ejercicios, asignadaA } = req.body || {};
  const errors = validateRoutine({ nombre, ejercicios });
  if (errors.length) return res.status(400).json({ errores: errors });

  let destino = req.user.id;
  if (asignadaA && asignadaA !== req.user.id) {
    if (req.user.rol === ROLES.USUARIO) {
      return res.status(403).json({ error: 'Solo entrenadores o administradores asignan rutinas.' });
    }
    if (!userStore.findById(asignadaA)) {
      return res.status(404).json({ error: 'El usuario destino no existe.' });
    }
    destino = asignadaA;
  }

  const routine = routineStore.create({ nombre, ejercicios, creadaPor: req.user.id, asignadaA: destino });
  return res.status(201).json({ rutina: routine });
}

function list(req, res) {
  const rutinas =
    req.user.rol === ROLES.ADMIN ? routineStore.findAll() : routineStore.findByUser(req.user.id);
  res.json({ rutinas });
}

function getOne(req, res) {
  const routine = routineStore.findById(req.params.id);
  if (!routine) return res.status(404).json({ error: 'Rutina no encontrada.' });
  const esDueno = routine.asignadaA === req.user.id || routine.creadaPor === req.user.id;
  if (!esDueno && req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tienes acceso a esta rutina.' });
  }
  return res.json({ rutina: routine });
}

function remove(req, res) {
  if (!routineStore.remove(req.params.id)) {
    return res.status(404).json({ error: 'Rutina no encontrada.' });
  }
  return res.status(204).end();
}

module.exports = { create, list, getOne, remove };
