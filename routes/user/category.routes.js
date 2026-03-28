const express = require('express');
const router = express.Router();
const userCategoryController = require('../../controllers/user/category.controller');
const { cacheMiddleware } = require('../../middlewares/cache');

// Public routes
router.get(
  '/',
  cacheMiddleware(3600),
  userCategoryController.getAllCategories
);

router.get(
  '/:slug',
  cacheMiddleware(600),
  userCategoryController.getCategoryBySlug
);

router.get(
  '/:id/blogs',
  cacheMiddleware(300),
  userCategoryController.getCategoryWithBlogs
);

module.exports = router;