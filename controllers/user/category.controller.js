const CategoryService = require('../../services/category.service');
const ApiResponse = require('../../utils/apiResponse');
const catchAsync = require('../../utils/catchAsync');

class UserCategoryController {
  constructor() {
    this.categoryService = new CategoryService();
  }

  getAllCategories = catchAsync(async (req, res) => {
    const categories = await this.categoryService.getAllCategories();
    res.json(ApiResponse.success(res, categories, 'Categories retrieved successfully'));
  });

  getCategoryBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const category = await this.categoryService.getCategoryBySlug(slug);
    res.json(ApiResponse.success(res, category, 'Category retrieved successfully'));
  });

  getCategoryWithBlogs = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'name avatar' },
    };

    const result = await this.categoryService.getCategoryWithBlogs(id, options);
    const total = result.blogs.length;

    ApiResponse.paginated(res, result.blogs, page, limit, total, 'Category blogs retrieved');
  });
}

module.exports = new UserCategoryController();