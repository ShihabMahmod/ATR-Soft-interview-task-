const BaseService = require('./base.service');
const UserRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../config/email');
const emailTemplates = require('../utils/emailTemplates');
const crypto = require('crypto');

class UserService extends BaseService {
  constructor() {
    super(new UserRepository());
  }

  async register(userData) {
    // Check if user exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await this.repository.create({
      ...userData,
      emailVerificationToken: verificationToken,
      emailVerificationExpire: verificationExpire,
    });

    // Send verification email
    const template = emailTemplates.verifyEmail(
      user.name,
      verificationToken
    );

    await sendEmail({
      email: user.email,
      subject: template.subject,
      message: template.message,
    });

    // Generate token
    const token = user.getSignedJwtToken();

    return { user, token };
  }

  async login(email, password) {
    // Check for user
    const user = await this.repository.findByEmail(email, true);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Generate token
    const token = user.getSignedJwtToken();

    return { user, token };
  }

  async verifyEmail(token) {
    const user = await this.repository.verifyEmail(token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    // Send welcome email
    const template = emailTemplates.welcomeEmail(user.name);
    await sendEmail({
      email: user.email,
      subject: template.subject,
      message: template.message,
    });

    return user;
  }

  async forgotPassword(email) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await this.repository.setResetPasswordToken(email, resetToken, resetExpire);

    // Send reset email
    const template = emailTemplates.resetPassword(user.name, resetToken);
    await sendEmail({
      email: user.email,
      subject: template.subject,
      message: template.message,
    });

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token, newPassword) {
    const user = await this.repository.findByResetToken(token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    await this.repository.resetPassword(user._id, newPassword);

    return { message: 'Password reset successful' };
  }

  async updateProfile(userId, data) {
    const user = await this.repository.updateProfile(userId, data);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.repository.findById(userId, null, '+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async uploadAvatar(userId, file) {
    const user = await this.repository.updateById(userId, {
      avatar: file.filename,
    });

    return user;
  }

  async getUserWithBlogs(userId) {
    const user = await this.repository.findWithBlogs(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}

module.exports = UserService;