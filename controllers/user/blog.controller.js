const BlogService = require('../../services/blog.service');
const CommentService = require('../../services/comment.service');
const LikeService = require('../../services/like.service');
const ApiResponse = require('../../utils/apiResponse');
const catchAsync = require('../../utils/catchAsync');

class UserBlogController {
  constructor() {
    this.blogService = new BlogService();
    this.commentService = new CommentService();
    this.likeService = new LikeService();
  }

  getPublishedBlogs = catchAsync(async (req, res) => {
    const { page, limit, category, author, search, tags, sortBy, sortOrder } = req.query;

    const options = {
      sort: { [sortBy]: sortOrder },
      limit,
      skip: (page - 1) * limit,
      populate: [
        { path: 'author', select: 'name avatar' },
        { path: 'category', select: 'name slug' },
      ],
    };

    let blogs;
    let total;

    if (search) {
      blogs = await this.blogService.searchBlogs(search, options);
      total = await this.blogService.count({ $text: { $search: search }, status: 'published' });
    } else if (category) {
      blogs = await this.blogService.getBlogsByCategory(category, options);
      total = await this.blogService.count({ category, status: 'published' });
    } else if (author) {
      blogs = await this.blogService.getUserBlogs(author, { ...options, filter: { status: 'published' } });
      total = await this.blogService.count({ author, status: 'published' });
    } else {
      blogs = await this.blogService.getPublishedBlogs({}, options);
      total = await this.blogService.count({ status: 'published' });
    }

    ApiResponse.paginated(res, blogs, page, limit, total, 'Blogs retrieved successfully');
  });

  getBlogBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;
    
    // Increment view count
    await this.blogService.incrementViewsBySlug(slug);
    
    const blog = await this.blogService.getBlogBySlug(slug);
    
    // Get comments
    const comments = await this.commentService.getBlogComments(blog._id, {
      populate: { path: 'user', select: 'name avatar' },
    });

    // Check if user liked this blog
    let userLiked = false;
    if (req.user) {
      const like = await this.likeService.checkUserLike(req.user.id, blog._id);
      userLiked = !!like;
    }

    res.json(
      ApiResponse.success(
        res,
        {
          ...blog.toObject(),
          comments,
          userLiked,
        },
        'Blog retrieved successfully'
      )
    );
  });

  getPopularBlogs = catchAsync(async (req, res) => {
    const blogs = await this.blogService.getPopularBlogs(5);
    res.json(ApiResponse.success(res, blogs, 'Popular blogs retrieved'));
  });

  getRelatedBlogs = catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await this.blogService.getBlogById(id);
    const related = await this.blogService.getRelatedBlogs(
      id,
      blog.category._id,
      blog.tags,
      3
    );

    res.json(ApiResponse.success(res, related, 'Related blogs retrieved'));
  });

  // Comments
  addComment = catchAsync(async (req, res) => {
    const comment = await this.commentService.createComment(
      {
        ...req.body,
        blog: req.params.blogId,
      },
      req.user.id
    );

    res.status(201).json(ApiResponse.success(res, comment, 'Comment added successfully'));
  });

  updateComment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await this.commentService.updateComment(id, content, req.user.id);

    res.json(ApiResponse.success(res, comment, 'Comment updated successfully'));
  });

  deleteComment = catchAsync(async (req, res) => {
    const { id } = req.params;
    await this.commentService.deleteComment(id, req.user.id);

    res.json(ApiResponse.success(res, null, 'Comment deleted successfully'));
  });

  getBlogComments = catchAsync(async (req, res) => {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
    };

    const comments = await this.commentService.getBlogComments(blogId, options);
    const total = await this.commentService.count({ blog: blogId, status: 'approved' });

    ApiResponse.paginated(res, comments, page, limit, total, 'Comments retrieved');
  });

  // Likes
  toggleLike = catchAsync(async (req, res) => {
    const result = await this.likeService.toggleLike(req.user.id, req.body);

    res.json(
      ApiResponse.success(
        res,
        result,
        result.liked ? 'Liked successfully' : 'Unliked successfully'
      )
    );
  });

  getBlogLikes = catchAsync(async (req, res) => {
    const { blogId } = req.params;
    const { likes, count } = await this.likeService.getBlogLikes(blogId);

    res.json(ApiResponse.success(res, { likes, count }, 'Likes retrieved'));
  });

  // User's own blogs
  getUserBlogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'category', select: 'name' },
    };

    const filter = { author: req.user.id };
    if (status) {
      filter.status = status;
    }

    const blogs = await this.blogService.find(filter, options);
    const total = await this.blogService.count(filter);

    ApiResponse.paginated(res, blogs, page, limit, total, 'Your blogs retrieved');
  });

  createBlog = catchAsync(async (req, res) => {
    const blog = await this.blogService.createBlog(
      req.body,
      req.user.id,
      req.file
    );

    res.status(201).json(ApiResponse.success(res, blog, 'Blog created successfully'));
  });

  updateBlog = catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await this.blogService.updateBlog(
      id,
      req.body,
      req.user.id,
      req.file
    );

    res.json(ApiResponse.success(res, blog, 'Blog updated successfully'));
  });

  deleteBlog = catchAsync(async (req, res) => {
    const { id } = req.params;
    await this.blogService.deleteBlog(id, req.user.id);

    res.json(ApiResponse.success(res, null, 'Blog deleted successfully'));
  });
}

module.exports = new UserBlogController();