const BaseService = require('./base.service');
const BlogRepository = require('../repositories/blog.repository');
const ApiError = require('../utils/ApiError');
const CacheUtil = require('../utils/cache');
const { deleteFile } = require('../utils/fileUpload');
const path = require('path');

class BlogService extends BaseService {
  constructor() {
    super(new BlogRepository());
    this.cache = new CacheUtil('blog');
  }

  async createBlog(blogData, authorId, file = null) {
    const blog = await this.repository.create({
      ...blogData,
      author: authorId,
      featuredImage: file ? file.filename : undefined,
    });

    // Clear cache
    await this.cache.delPattern('blogs:*');

    return blog;
  }

  async getBlogById(id) {
    // Try cache first
    const cached = await this.cache.get(`blog:${id}`);
    if (cached) {
      return cached;
    }

    const blog = await this.repository.findById(id, [
      { path: 'author', select: 'name email avatar' },
      { path: 'category', select: 'name slug' },
    ]);

    if (!blog) {
      throw ApiError.notFound('Blog not found');
    }

    // Cache blog
    await this.cache.set(`blog:${id}`, blog, 3600);

    return blog;
  }

  async getBlogBySlug(slug) {
    // Try cache first
    const cached = await this.cache.get(`blog:slug:${slug}`);
    if (cached) {
      return cached;
    }

    const blog = await this.repository.findBySlug(slug);

    if (!blog) {
      throw ApiError.notFound('Blog not found');
    }

    // Cache blog
    await this.cache.set(`blog:slug:${slug}`, blog, 3600);

    return blog;
  }

  async updateBlog(id, updateData, userId, file = null) {
    const blog = await this.repository.findById(id);

    if (!blog) {
      throw ApiError.notFound('Blog not found');
    }

    // Check ownership
    if (blog.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update your own blogs');
    }

    // Handle image update
    if (file && blog.featuredImage && blog.featuredImage !== 'default-blog.jpg') {
      deleteFile(path.join('public/uploads/blogs', blog.featuredImage));
    }

    const updatedBlog = await this.repository.updateById(id, {
      ...updateData,
      featuredImage: file ? file.filename : blog.featuredImage,
    });

    // Clear cache
    await this.cache.delPattern('blogs:*');
    await this.cache.del(`blog:${id}`);
    await this.cache.del(`blog:slug:${blog.slug}`);

    return updatedBlog;
  }

  async deleteBlog(id, userId) {
    const blog = await this.repository.findById(id);

    if (!blog) {
      throw ApiError.notFound('Blog not found');
    }

    // Check ownership or admin
    if (blog.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own blogs');
    }

    // Delete featured image
    if (blog.featuredImage && blog.featuredImage !== 'default-blog.jpg') {
      deleteFile(path.join('public/uploads/blogs', blog.featuredImage));
    }

    await this.repository.deleteById(id);

    // Clear cache
    await this.cache.delPattern('blogs:*');
    await this.cache.del(`blog:${id}`);
    await this.cache.del(`blog:slug:${blog.slug}`);

    return { message: 'Blog deleted successfully' };
  }

  async getPublishedBlogs(filters, options) {
    const cacheKey = `blogs:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const blogs = await this.repository.findPublished(options);
    
    // Cache for 10 minutes
    await this.cache.set(cacheKey, blogs, 600);

    return blogs;
  }

  async getUserBlogs(userId, options) {
    return await this.repository.findByAuthor(userId, options);
  }

  async getBlogsByCategory(categoryId, options) {
    return await this.repository.findByCategory(categoryId, options);
  }

  async searchBlogs(query, options) {
    return await this.repository.search(query, options);
  }

  async incrementViews(id) {
    await this.repository.incrementViews(id);
    await this.cache.del(`blog:${id}`);
    await this.cache.del(`blog:slug:*`);
  }

  async getPopularBlogs(limit = 5) {
    const cacheKey = `blogs:popular:${limit}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const blogs = await this.repository.getPopular(limit);
    await this.cache.set(cacheKey, blogs, 3600);

    return blogs;
  }

  async getRelatedBlogs(blogId, categoryId, tags, limit = 3) {
    return await this.repository.getRelated(blogId, categoryId, tags, limit);
  }

  async getBlogStats() {
    const cacheKey = 'blogs:stats';
    
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const total = await this.repository.count({ status: 'published' });
    const byCategory = await this.repository.countByCategory();
    const popular = await this.repository.getPopular(10);

    const stats = { total, byCategory, popular };
    await this.cache.set(cacheKey, stats, 1800); // 30 minutes

    return stats;
  }
}

module.exports = BlogService;