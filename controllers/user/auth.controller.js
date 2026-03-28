const UserService = require('../../services/user.service');
const ApiResponse = require('../../utils/apiResponse');
const catchAsync = require('../../utils/catchAsync');

class AuthController {
  constructor() {
    this.userService = new UserService();
  }

  register = catchAsync(async (req, res) => {
    
    const { user, token } = await this.userService.register(req.body);

    res.status(201).json(
      ApiResponse.success(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
          },
          token,
        },
        'Registration successful. Please verify your email.'
      )
    );
  });

  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await this.userService.login(email, password);

    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.json(
      ApiResponse.success(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
          },
          token,
        },
        'Login successful'
      )
    );
  });

  logout = catchAsync(async (req, res) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.json(ApiResponse.success(res, null, 'Logout successful'));
  });

  verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.params;
    const user = await this.userService.verifyEmail(token);

    res.json(
      ApiResponse.success(
        res,
        {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        'Email verified successfully'
      )
    );
  });

  forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    await this.userService.forgotPassword(email);

    res.json(ApiResponse.success(res, null, 'Password reset email sent'));
  });

  resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    await this.userService.resetPassword(token, password);

    res.json(ApiResponse.success(res, null, 'Password reset successful'));
  });

  getMe = catchAsync(async (req, res) => {
    const user = await this.userService.getUserWithBlogs(req.user.id);

    res.json(ApiResponse.success(res, user, 'User profile retrieved'));
  });

  updateProfile = catchAsync(async (req, res) => {
    const user = await this.userService.updateProfile(req.user.id, req.body);

    res.json(
      ApiResponse.success(
        res,
        {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        'Profile updated successfully'
      )
    );
  });

  changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await this.userService.changePassword(req.user.id, currentPassword, newPassword);

    res.json(ApiResponse.success(res, null, 'Password changed successfully'));
  });

  uploadAvatar = catchAsync(async (req, res) => {
    if (!req.file) {
      return ApiResponse.error(res, 'Please upload an image', 400);
    }

    const user = await this.userService.uploadAvatar(req.user.id, req.file);

    res.json(
      ApiResponse.success(
        res,
        {
          avatar: user.avatar,
          avatarUrl: req.fileUrl,
        },
        'Avatar uploaded successfully'
      )
    );
  });
}

module.exports = new AuthController();