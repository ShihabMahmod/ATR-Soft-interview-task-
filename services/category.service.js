const BaseService = require('./base.service');
const CategoryRepository = require('../repositories/category.repository');
const ApiError = require('../utils/ApiError');
const CacheUtil = require('../utils/cache');
const { deleteFile } = require('../utils/fileUpload');
const path = require('path');

class CategoryService extends BaseService {
  constructor() {
    super(new CategoryRepository());
    this.cache = new CacheUtil('category');
  }

  async createCategory(categoryData, userId, file = null) {
    // Check if category exists
    const existing = await this.repository.findByName(categoryData.name);
    if (existing) {
      throw ApiError.conflict('Category already exists');
    }

    const category = await this.repository.create({
      ...categoryData,
      createdBy: userId,
      image: file ? file.filename : undefined,
    });

    // Clear cache
    await this.cache.delPattern('categories:*');

    return category;
  }

  async getCategoryById(id) {
    const cached = await this.cache.get(`category:${id}`);
    if (cached) {
      return cached;
    }

    const category = await this.repository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    await this.cache.set(`category:${id}`, category, 3600);
    return category;
  }

  async getCategoryBySlug(slug) {
    const cached = await this.cache.get(`category:slug:${slug}`);
    if (cached) {
      return cached;
    }

    const category = await this.repository.findBySlug(slug);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    await this.cache.set(`category:slug:${slug}`, category, 3600);
    return category;
  }

  async updateCategory(id, updateData, userId, file = null) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Check if user is admin or creator
    if (category.createdBy.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update categories you created');
    }

    // Check if name is being updated and if it already exists
    if (updateData.name && updateData.name !== category.name) {
      const existing = await this.repository.findByName(updateData.name);
      if (existing) {
        throw ApiError.conflict('Category name already exists');
      }
    }

    // Handle image update
    if (file && category.image && category.image !== 'default-category.jpg') {
      deleteFile(path.join('public/uploads/categories', category.image));
    }

    const updatedCategory = await this.repository.updateById(id, {
      ...updateData,
      image: file ? file.filename : category.image,
    });

    // Clear cache
    await this.cache.delPattern('categories:*');
    await this.cache.del(`category:${id}`);
    await this.cache.del(`category:slug:${category.slug}`);

    return updatedCategory;
  }

  async deleteCategory(id, userId) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Check if user is admin or creator
    if (category.createdBy.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete categories you created');
    }

    // Check if category has blogs
    const blogCount = await category.blogs;
    if (blogCount > 0) {
      throw ApiError.badRequest('Cannot delete category with blogs');
    }

    // Delete image
    if (category.image && category.image !== 'default-category.jpg') {
      deleteFile(path.join('public/uploads/categories', category.image));
    }

    await this.repository.deleteById(id);

    // Clear cache
    await this.cache.delPattern('categories:*');
    await this.cache.del(`category:${id}`);
    await this.cache.del(`category:slug:${category.slug}`);

    return { message: 'Category deleted successfully' };
  }

  async getAllCategories() {
    const cached = await this.cache.get('categories:all');
    if (cached) {
      return cached;
    }

    const categories = await this.repository.getWithBlogCount();
    await this.cache.set('categories:all', categories, 3600);

    return categories;
  }

  async getCategoryWithBlogs(categoryId, blogOptions = {}) {
    const result = await this.repository.findWithBlogs(categoryId, blogOptions);
    
    if (!result || !result.category) {
      throw ApiError.notFound('Category not found');
    }

    return result;
  }
}

module.exports = CategoryService;