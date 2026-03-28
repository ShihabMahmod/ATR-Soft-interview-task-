const BaseRepository = require('./base.repository');
const Like = require('../models/Like');

class LikeRepository extends BaseRepository {
  constructor() {
    super(Like);
  }

  async findByBlog(blogId) {
    return await this.find({ blog: blogId }).populate('user', 'name email avatar');
  }

  async findByComment(commentId) {
    return await this.find({ comment: commentId }).populate('user', 'name email avatar');
  }

  async findByUserAndBlog(userId, blogId) {
    return await this.findOne({ user: userId, blog: blogId });
  }

  async findByUserAndComment(userId, commentId) {
    return await this.findOne({ user: userId, comment: commentId });
  }

  async toggle(userId, data) {
    const { blog, comment } = data;
    
    const filter = blog ? { blog, user: userId } : { comment, user: userId };
    
    const existing = await this.findOne(filter);
    
    if (existing) {
      await this.deleteById(existing._id);
      return { liked: false, like: null };
    } else {
      const like = await this.create({ ...data, user: userId });
      return { liked: true, like };
    }
  }

  async countByBlog(blogId) {
    return await this.count({ blog: blogId });
  }

  async countByComment(commentId) {
    return await this.count({ comment: commentId });
  }

  async getUserLikes(userId) {
    const [blogs, comments] = await Promise.all([
      this.find({ user: userId, blog: { $ne: null } }).populate('blog'),
      this.find({ user: userId, comment: { $ne: null } }).populate('comment'),
    ]);

    return { blogs, comments };
  }
}

module.exports = LikeRepository;