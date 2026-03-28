const BaseService = require('./base.service');
const LikeRepository = require('../repositories/like.repository');
const BlogRepository = require('../repositories/blog.repository');
const CommentRepository = require('../repositories/comment.repository');
const ApiError = require('../utils/ApiError');

class LikeService extends BaseService {
  constructor() {
    super(new LikeRepository());
    this.blogRepository = new BlogRepository();
    this.commentRepository = new CommentRepository();
  }

  async toggleLike(userId, data) {
    const { blog, comment } = data;

    // Validate and check if blog or comment exists
    if (blog) {
      const blogExists = await this.blogRepository.findById(blog);
      if (!blogExists) {
        throw ApiError.notFound('Blog not found');
      }
    }

    if (comment) {
      const commentExists = await this.commentRepository.findById(comment);
      if (!commentExists) {
        throw ApiError.notFound('Comment not found');
      }
    }

    const result = await this.repository.toggle(userId, data);
    return result;
  }

  async getBlogLikes(blogId) {
    const likes = await this.repository.findByBlog(blogId);
    const count = await this.repository.countByBlog(blogId);

    return { likes, count };
  }

  async getCommentLikes(commentId) {
    const likes = await this.repository.findByComment(commentId);
    const count = await this.repository.countByComment(commentId);

    return { likes, count };
  }

  async getUserLikes(userId) {
    return await this.repository.getUserLikes(userId);
  }

  async checkUserLike(userId, blogId, commentId) {
    if (blogId) {
      return await this.repository.findByUserAndBlog(userId, blogId);
    }
    if (commentId) {
      return await this.repository.findByUserAndComment(userId, commentId);
    }
    return null;
  }
}

module.exports = LikeService;