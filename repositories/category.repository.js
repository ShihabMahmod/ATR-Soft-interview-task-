const BaseRepository = require('./base.repository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findByName(name) {
    return await this.findOne({ name });
  }

  async findBySlug(slug) {
    return await this.findOne({ slug });
  }

  async getWithBlogCount() {
    return await this.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'category',
          as: 'blogs',
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          image: 1,
          blogCount: { $size: '$blogs' },
        },
      },
      { $sort: { name: 1 } },
    ]);
  }

  async findWithBlogs(categoryId, options = {}) {
    const category = await this.findById(categoryId);
    if (!category) return null;

    const blogs = await BlogRepository.find(
      { category: categoryId, status: 'published' },
      options
    );

    return { category, blogs };
  }
}

module.exports = CategoryRepository;