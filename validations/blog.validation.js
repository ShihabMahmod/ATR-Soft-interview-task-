const { z } = require('zod');

const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    excerpt: z.string().max(500, 'Excerpt too long').optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published']).default('draft'),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    metaKeywords: z.string().optional(),
  }),
});

const updateBlogSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(50).optional(),
    excerpt: z.string().max(500).optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published']).optional(),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    metaKeywords: z.string().optional(),
  }),
});

const getBlogSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
  }),
});

const deleteBlogSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
  }),
});

const getBlogsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    author: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(['draft', 'published']).optional(),
    search: z.string().optional(),
    tags: z.string().optional(),
    sortBy: z.enum(['createdAt', 'title', 'views']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
  getBlogSchema,
  deleteBlogSchema,
  getBlogsSchema,
};