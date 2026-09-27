// Registro e inicio de sesión de usuarios.
const bcrypt = require('bcryptjs');
const config = require('../config');
const userStore = require('../models/userStore');
const { signToken } = require('../middleware/auth');
const { validateRegistration } = require('../utils/validators');
const { ROLES } = require('../utils/roles');

async function register(req, res) {
  const { nombre, email, password } = req.body || {};
  const errors = validateRegistration({ nombre, email, password });
  if (errors.length) return res.status(400).json({ errores: errors });

  if (userStore.findByEmail(email)) {
    return res.status(409).json({ error: 'El correo ya está registrado.' });
  }

  // Por seguridad, el registro público SIEMPRE crea el rol "usuario".
  // Solo un administrador puede asignar otros roles.
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const user = userStore.create({ nombre, email, passwordHash, rol: ROLES.USUARIO });

  return res.status(201).json({ usuario: userStore.toPublic(user), token: signToken(user) });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const user = userStore.findByEmail(email);
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  // Mismo mensaje en ambos casos para no revelar qué correos existen.
  if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas.' });

  return res.json({ usuario: userStore.toPublic(user), token: signToken(user) });
}

function me(req, res) {
  const user = userStore.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
  return res.json({ usuario: userStore.toPublic(user) });
}

module.exports = { register, login, me };
