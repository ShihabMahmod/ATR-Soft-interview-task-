const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(500).optional(),
  }),
});

const getCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
});

const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema,
};