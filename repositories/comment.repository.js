const BaseRepository = require('./base.repository');
const Comment = require('../models/Comment');

class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment);
  }

  async findByBlog(blogId, options = {}) {
    return await this.find(
      { blog: blogId, parentComment: null },
      {
        populate: [
          { path: 'user', select: 'name email avatar' },
          { path: 'replies', populate: { path: 'user', select: 'name email avatar' } },
        ],
        ...options,
      }
    );
  }

  async findReplies(commentId, options = {}) {
    return await this.find(
      { parentComment: commentId },
      {
        populate: { path: 'user', select: 'name email avatar' },
        ...options,
      }
    );
  }

  async approveComment(commentId) {
    return await this.updateById(commentId, { status: 'approved' });
  }

  async rejectComment(commentId) {
    return await this.updateById(commentId, { status: 'rejected' });
  }

  async getUserComments(userId, options = {}) {
    return await this.find(
      { user: userId },
      {
        populate: { path: 'blog', select: 'title slug' },
        ...options,
      }
    );
  }

  async countByBlog(blogId, status = 'approved') {
    return await this.count({ blog: blogId, status });
  }

  async toggleLike(commentId, userId) {
    const comment = await this.findById(commentId);
    if (!comment) return null;

    const hasLiked = comment.likes.includes(userId);
    
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    return comment;
  }
}

module.exports = CommentRepository;