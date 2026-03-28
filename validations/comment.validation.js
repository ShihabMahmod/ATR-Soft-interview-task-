const { z } = require('zod');

const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
    blog: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
    parentComment: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent comment ID').optional(),
  }),
});

const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID'),
  }),
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
});

const getCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID'),
  }),
});

const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID'),
  }),
});

const getBlogCommentsSchema = z.object({
  params: z.object({
    blogId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
  }),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
  getCommentSchema,
  deleteCommentSchema,
  getBlogCommentsSchema,
};