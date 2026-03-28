const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
  }).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: "Current password is required to change password",
    path: ['currentPassword'],
  }),
});

const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};