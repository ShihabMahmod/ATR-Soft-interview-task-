const { z } = require('zod');

const toggleLikeSchema = z.object({
  body: z.object({
    blog: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID').optional(),
    comment: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID').optional(),
  }).refine((data) => {
    return (data.blog && !data.comment) || (!data.blog && data.comment);
  }, {
    message: 'Either blog or comment must be provided, but not both',
  }),
});

const getBlogLikesSchema = z.object({
  params: z.object({
    blogId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
  }),
});

const getCommentLikesSchema = z.object({
  params: z.object({
    commentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid comment ID'),
  }),
});

module.exports = {
  toggleLikeSchema,
  getBlogLikesSchema,
  getCommentLikesSchema,
};