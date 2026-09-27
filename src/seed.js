// Crea el primer administrador a partir de variables de entorno (si se definen).
const bcrypt = require('bcryptjs');
const config = require('./config');
const userStore = require('./models/userStore');
const { ROLES } = require('./utils/roles');

async function seedAdmin(email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD) {
  if (!email || !password || userStore.findByEmail(email)) return null;
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  return userStore.create({ nombre: 'Administrador', email, passwordHash, rol: ROLES.ADMIN });
}

module.exports = { seedAdmin };
