const express = require('express');
const router = express.Router();
const {
  registerUser,
  updateUser,
  updateUserStatus,
  getUsersByRole
} = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, getUsersByRole);
router.post('/register', authenticate, registerUser);
router.put('/:id', authenticate, updateUser);
router.patch('/:id/status', authenticate, updateUserStatus);

module.exports = router;
