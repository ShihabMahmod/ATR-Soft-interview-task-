const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const { protect, authorize } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { uploadSingle } = require('../../middlewares/upload');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../../validations/category.validation');
const {
  updateUserSchema,
} = require('../../validations/user.validation');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put(
  '/users/:id',
  validate(updateUserSchema),
  adminController.updateUser
);
router.delete('/users/:id', adminController.deleteUser);

// Blog management
router.get('/blogs', adminController.getAllBlogs);
router.put('/blogs/:id/approve', adminController.approveBlog);
router.put('/blogs/:id/reject', adminController.rejectBlog);

// Category management
router.post(
  '/categories',
  uploadSingle('categoryImage'),
  validate(createCategorySchema),
  adminController.createCategory
);
router.put(
  '/categories/:id',
  uploadSingle('categoryImage'),
  validate(updateCategorySchema),
  adminController.updateCategory
);
router.delete('/categories/:id', adminController.deleteCategory);

// Comment management
router.get('/comments', adminController.getAllComments);
router.put('/comments/:id/approve', adminController.approveComment);
router.put('/comments/:id/reject', adminController.rejectComment);
router.delete('/comments/:id', adminController.deleteComment);

// System
router.post('/cache/clear', adminController.clearCache);
router.get('/system/stats', adminController.getSystemStats);

module.exports = router;