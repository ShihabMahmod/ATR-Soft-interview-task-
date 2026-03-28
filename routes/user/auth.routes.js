const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/auth.controller');
const { protect } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { authLimiter } = require('../../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} = require('../../validations/user.validation');
const { uploadSingle } = require('../../middlewares/upload');

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.get(
  '/verify-email/:token',
  validate(verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.put(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.use(protect);

router.get('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put(
  '/profile',
  validate(updateProfileSchema),
  authController.updateProfile
);
router.put('/change-password', authController.changePassword);
router.post(
  '/avatar',
  uploadSingle('avatar'),
  authController.uploadAvatar
);

module.exports = router;