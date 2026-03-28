const UserService = require('../../services/user.service');
const BlogService = require('../../services/blog.service');
const CategoryService = require('../../services/category.service');
const CommentService = require('../../services/comment.service');
const ApiResponse = require('../../utils/apiResponse');
const catchAsync = require('../../utils/catchAsync');

class AdminController {
  constructor() {
    this.userService = new UserService();
    this.blogService = new BlogService();
    this.categoryService = new CategoryService();
    this.commentService = new CommentService();
  }

  // Dashboard
  getDashboardStats = catchAsync(async (req, res) => {
    const [
      totalUsers,
      totalBlogs,
      totalCategories,
      totalComments,
      popularBlogs,
      recentUsers,
      blogStats,
    ] = await Promise.all([
      this.userService.count(),
      this.blogService.count(),
      this.categoryService.count(),
      this.commentService.count(),
      this.blogService.getPopularBlogs(5),
      this.userService.find({}, { limit: 5, sort: { createdAt: -1 } }),
      this.blogService.getBlogStats(),
    ]);

    res.json(
      ApiResponse.success(res, {
        totals: {
          users: totalUsers,
          blogs: totalBlogs,
          categories: totalCategories,
          comments: totalComments,
        },
        popularBlogs,
        recentUsers,
        blogStats,
      })
    );
  });

  // User Management
  getAllUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search, role } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
    };

    const users = await this.userService.find(filter, options);
    const total = await this.userService.count(filter);

    ApiResponse.paginated(res, users, page, limit, total, 'Users retrieved');
  });

  getUserDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await this.userService.getUserWithBlogs(id);
    res.json(ApiResponse.success(res, user, 'User details retrieved'));
  });

  updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await this.userService.updateProfile(id, req.body);
    res.json(ApiResponse.success(res, user, 'User updated successfully'));
  });

  deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    await this.userService.delete(id);
    res.json(ApiResponse.success(res, null, 'User deleted successfully'));
  });

  // Blog Management
  getAllBlogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'author', select: 'name email' },
        { path: 'category', select: 'name' },
      ],
    };

    const blogs = await this.blogService.find(filter, options);
    const total = await this.blogService.count(filter);

    ApiResponse.paginated(res, blogs, page, limit, total, 'Blogs retrieved');
  });

  approveBlog = catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await this.blogService.update(id, { status: 'published' });
    res.json(ApiResponse.success(res, blog, 'Blog approved successfully'));
  });

  rejectBlog = catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await this.blogService.update(id, { status: 'draft' });
    res.json(ApiResponse.success(res, blog, 'Blog rejected'));
  });

  // Category Management
  createCategory = catchAsync(async (req, res) => {
    const category = await this.categoryService.createCategory(
      req.body,
      req.user.id,
      req.file
    );
    res.status(201).json(ApiResponse.success(res, category, 'Category created'));
  });

  updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const category = await this.categoryService.updateCategory(
      id,
      req.body,
      req.user.id,
      req.file
    );
    res.json(ApiResponse.success(res, category, 'Category updated'));
  });

  deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    await this.categoryService.deleteCategory(id, req.user.id);
    res.json(ApiResponse.success(res, null, 'Category deleted'));
  });

  // Comment Management
  getAllComments = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'blog', select: 'title' },
      ],
    };

    const comments = await this.commentService.find(filter, options);
    const total = await this.commentService.count(filter);

    ApiResponse.paginated(res, comments, page, limit, total, 'Comments retrieved');
  });

  approveComment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const comment = await this.commentService.approveComment(id);
    res.json(ApiResponse.success(res, comment, 'Comment approved'));
  });

  rejectComment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const comment = await this.commentService.rejectComment(id);
    res.json(ApiResponse.success(res, comment, 'Comment rejected'));
  });

  deleteComment = catchAsync(async (req, res) => {
    const { id } = req.params;
    await this.commentService.deleteComment(id, req.user.id, true);
    res.json(ApiResponse.success(res, null, 'Comment deleted'));
  });

  // System
  clearCache = catchAsync(async (req, res) => {
    const { pattern } = req.body;
    const cache = new (require('../../utils/cache'))();
    await cache.delPattern(pattern || '*');
    res.json(ApiResponse.success(res, null, 'Cache cleared'));
  });

  getSystemStats = catchAsync(async (req, res) => {
    const os = require('os');
    
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: os.cpus(),
      loadAvg: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version,
    };

    res.json(ApiResponse.success(res, stats, 'System stats retrieved'));
  });
}

module.exports = new AdminController();