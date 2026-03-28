const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    image: {
      type: String,
      default: 'default-category.jpg',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for blogs in this category
categorySchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Create category slug from the name
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Category', categorySchema);