const express = require('express');
const ctrl = require('../controllers/routineController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authenticate);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.remove);

module.exports = router;
