const BaseRepository = require('./base.repository');
const Blog = require('../models/Blog');

class BlogRepository extends BaseRepository {
  constructor() {
    super(Blog);
  }

  async findPublished(options = {}) {
    const filter = { status: 'published' };
    return await this.find(filter, options);
  }

  async findBySlug(slug) {
    return await this.findOne({ slug }).populate('author', 'name email avatar').populate('category', 'name slug');
  }

  async findByAuthor(authorId, options = {}) {
    return await this.find({ author: authorId }, options);
  }

  async findByCategory(categoryId, options = {}) {
    return await this.find({ category: categoryId, status: 'published' }, options);
  }

  async incrementViews(blogId) {
    return await this.updateById(blogId, { $inc: { views: 1 } });
  }

  async search(query, options = {}) {
    const filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
      status: 'published',
    };
    return await this.find(filter, options);
  }

  async getPopular(limit = 5) {
    return await this.find(
      { status: 'published' },
      { sort: { views: -1 }, limit }
    );
  }

  async getRelated(blogId, categoryId, tags = [], limit = 3) {
    const filter = {
      _id: { $ne: blogId },
      status: 'published',
      $or: [{ category: categoryId }, { tags: { $in: tags } }],
    };
    return await this.find(filter, { sort: { views: -1 }, limit });
  }

  async countByCategory() {
    return await this.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { category: '$category.name', count: 1 } },
    ]);
  }
}

module.exports = BlogRepository;