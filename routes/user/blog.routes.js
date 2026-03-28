const express = require('express');
const router = express.Router();
const userBlogController = require('../../controllers/user/blog.controller');
const { protect } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { cacheMiddleware } = require('../../middlewares/cache');
const { uploadSingle } = require('../../middlewares/upload');
const {
  createBlogSchema,
  updateBlogSchema,
  getBlogSchema,
  getBlogsSchema,
} = require('../../validations/blog.validation');
const {
  createCommentSchema,
  updateCommentSchema,
  getBlogCommentsSchema,
} = require('../../validations/comment.validation');
const { toggleLikeSchema } = require('../../validations/like.validation');

// Public routes
router.get(
  '/',
  validate(getBlogsSchema),
  cacheMiddleware(600),
  userBlogController.getPublishedBlogs
);

router.get(
  '/popular',
  cacheMiddleware(3600),
  userBlogController.getPopularBlogs
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  userBlogController.getBlogBySlug
);

router.get(
  '/:id/related',
  userBlogController.getRelatedBlogs
);

router.get(
  '/:blogId/comments',
  validate(getBlogCommentsSchema),
  cacheMiddleware(300),
  userBlogController.getBlogComments
);

router.get(
  '/:blogId/likes',
  userBlogController.getBlogLikes
);

// Protected routes
router.use(protect);

// User's own blogs
router.get('/user/me', userBlogController.getUserBlogs);
router.post(
  '/',
  uploadSingle('featuredImage'),
  validate(createBlogSchema),
  userBlogController.createBlog
);
router.put(
  '/:id',
  uploadSingle('featuredImage'),
  validate(updateBlogSchema),
  userBlogController.updateBlog
);
router.delete(
  '/:id',
  validate(getBlogSchema),
  userBlogController.deleteBlog
);

// Comments
router.post(
  '/:blogId/comments',
  validate(createCommentSchema),
  userBlogController.addComment
);
router.put(
  '/comments/:id',
  validate(updateCommentSchema),
  userBlogController.updateComment
);
router.delete(
  '/comments/:id',
  validate(getBlogSchema),
  userBlogController.deleteComment
);

// Likes
router.post(
  '/likes/toggle',
  validate(toggleLikeSchema),
  userBlogController.toggleLike
);

module.exports = router;