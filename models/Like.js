const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can like a blog or comment only once
likeSchema.index({ blog: 1, user: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, user: 1 }, { unique: true, sparse: true });

// Validate that either blog or comment is provided, but not both
likeSchema.pre('save', function (next) {
  if ((!this.blog && !this.comment) || (this.blog && this.comment)) {
    next(new Error('Either blog or comment must be provided, but not both'));
  }
  next();
});

module.exports = mongoose.model('Like', likeSchema);