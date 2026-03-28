const BaseRepository = require('./base.repository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return await query;
  }

  async findWithBlogs(userId) {
    return await this.model.findById(userId).populate({
      path: 'blogs',
      options: { sort: { createdAt: -1 }, limit: 10 },
    });
  }

  async verifyEmail(token) {
    return await this.updateOne(
      {
        emailVerificationToken: token,
        emailVerificationExpire: { $gt: Date.now() },
      },
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpire: undefined,
      }
    );
  }

  async setResetPasswordToken(email, token, expire) {
    return await this.updateOne(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpire: expire,
      }
    );
  }

  async findByResetToken(token) {
    return await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  async resetPassword(userId, password) {
    return await this.updateById(userId, {
      password,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    });
  }

  async updateProfile(userId, data) {
    const updateData = { ...data };
    if (updateData.email) {
      updateData.isEmailVerified = false;
    }
    return await this.updateById(userId, updateData);
  }
}

module.exports = UserRepository;