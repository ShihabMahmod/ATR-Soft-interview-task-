const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: String,
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot be more than 500 characters'],
    },
    featuredImage: {
      type: String,
      default: 'default-blog.jpg',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedAt: Date,
    views: {
      type: Number,
      default: 0,
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for comments
blogSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true,
});

// Virtual populate for likes
blogSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'blog',
  count: true,
});

// Create blog slug from the title
blogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Update publishedAt when status changes to published
blogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);