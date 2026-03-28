const emailTemplates = {
  verifyEmail: (name, token) => ({
    subject: 'Email Verification',
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${process.env.CLIENT_URL}/verify-email/${token}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                  color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If you didn't create an account, you can ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  }),

  resetPassword: (name, token) => ({
    subject: 'Password Reset',
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${name}!</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                  color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  }),

  welcomeEmail: (name) => ({
    subject: 'Welcome to Our Blog!',
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${name}!</h2>
        <p>Thank you for joining our blog community. We're excited to have you!</p>
        <p>You can now:</p>
        <ul>
          <li>Read and comment on blog posts</li>
          <li>Like your favorite articles</li>
          <li>Save posts for later reading</li>
        </ul>
        <a href="${process.env.CLIENT_URL}" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; 
                  color: white; text-decoration: none; border-radius: 5px;">
          Start Reading
        </a>
      </div>
    `,
  }),

  newCommentNotification: (blogTitle, commentAuthor, commentContent) => ({
    subject: `New Comment on "${blogTitle}"`,
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Comment!</h2>
        <p><strong>${commentAuthor}</strong> commented on your post "${blogTitle}":</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
          ${commentContent}
        </div>
        <a href="${process.env.CLIENT_URL}/blog/${blogTitle}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                  color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
          View Comment
        </a>
      </div>
    `,
  }),
};

module.exports = emailTemplates;