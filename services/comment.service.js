const BaseService = require('./base.service');
const CommentRepository = require('../repositories/comment.repository');
const BlogRepository = require('../repositories/blog.repository');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../config/email');
const emailTemplates = require('../utils/emailTemplates');

class CommentService extends BaseService {
  constructor() {
    super(new CommentRepository());
    this.blogRepository = new BlogRepository();
  }

  async createComment(commentData, userId) {
    // Check if blog exists and is published
    const blog = await this.blogRepository.findById(commentData.blog);
    if (!blog || blog.status !== 'published') {
      throw ApiError.notFound('Blog not found or not published');
    }

    // Check if parent comment exists if provided
    if (commentData.parentComment) {
      const parent = await this.repository.findById(commentData.parentComment);
      if (!parent) {
        throw ApiError.notFound('Parent comment not found');
      }
    }

    const comment = await this.repository.create({
      ...commentData,
      user: userId,
    });

    // Send notification to blog author
    if (blog.author.toString() !== userId.toString()) {
      const template = emailTemplates.newCommentNotification(
        blog.title,
        comment.user.name,
        comment.content
      );

      await sendEmail({
        email: blog.author.email,
        subject: template.subject,
        message: template.message,
      });
    }

    return comment.populate('user', 'name email avatar');
  }

  async getBlogComments(blogId, options) {
    return await this.repository.findByBlog(blogId, options);
  }

  async updateComment(id, content, userId) {
    const comment = await this.repository.findById(id);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // Check ownership
    if (comment.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update your own comments');
    }

    // Reset status to pending on update
    comment.content = content;
    comment.status = 'pending';
    await comment.save();

    return comment;
  }

  async deleteComment(id, userId, isAdmin = false) {
    const comment = await this.repository.findById(id);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // Check ownership or admin
    if (!isAdmin && comment.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    // Delete replies if any
    await this.repository.deleteMany({ parentComment: id });
    
    // Delete comment
    await this.repository.deleteById(id);

    return { message: 'Comment deleted successfully' };
  }

  async approveComment(id) {
    const comment = await this.repository.approveComment(id);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }
    return comment;
  }

  async rejectComment(id) {
    const comment = await this.repository.rejectComment(id);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }
    return comment;
  }

  async getUserComments(userId, options) {
    return await this.repository.getUserComments(userId, options);
  }

  async toggleLike(commentId, userId) {
    const comment = await this.repository.toggleLike(commentId, userId);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }
    return comment;
  }
}

module.exports = CommentService;