const express = require('express');
const ctrl = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/', ctrl.list);
router.patch('/:id/rol', ctrl.changeRole);
router.delete('/:id', ctrl.remove);

module.exports = router;
