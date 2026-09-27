// Administración de usuarios (solo administradores).
const userStore = require('../models/userStore');
const { ALL_ROLES } = require('../utils/roles');

function list(req, res) {
  res.json({ usuarios: userStore.findAll().map(userStore.toPublic) });
}

function changeRole(req, res) {
  const { rol } = req.body || {};
  if (!ALL_ROLES.includes(rol)) {
    return res.status(400).json({ error: `Rol inválido. Usa: ${ALL_ROLES.join(', ')}.` });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'No puedes cambiar tu propio rol.' });
  }
  const user = userStore.updateRole(req.params.id, rol);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
  return res.json({ usuario: userStore.toPublic(user) });
}

function remove(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
  }
  if (!userStore.remove(req.params.id)) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  return res.status(204).end();
}

module.exports = { list, changeRole, remove };
