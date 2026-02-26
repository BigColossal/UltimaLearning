import nodemailer from "nodemailer";

let transporter;

// Initialize email transporter
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  // Fallback: dev mode without email
  console.warn(
    "Email service not configured. Welcome emails will not be sent.",
  );
  transporter = null;
}

export const sendWelcomeEmail = async (user) => {
  if (!transporter) {
    console.log(`[DEV] Would send welcome email to ${user.email}`);
    return;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@ultimalearning.com",
      to: user.email,
      subject: "Welcome to UltimaLearning! 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">Welcome to UltimaLearning! 🚀</h1>
          
          <p>Hi ${user.name},</p>
          
          <p>We're excited to have you join our community! UltimaLearning is designed to help you master any skill through adaptive, AI-powered testing and project reviews.</p>
          
          <h2 style="color: #667eea;">What You Can Do:</h2>
          <ul>
            <li>Create learning nodes and organize them into skill trees</li>
            <li>Generate adaptive tests tailored to your level</li>
            <li>Submit projects for AI-powered code reviews</li>
            <li>Track your progress with XP and level milestones</li>
          </ul>
          
          <p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/hub" 
               style="display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Start Learning
            </a>
          </p>
          
          <p>Questions? We're here to help!</p>
          
          <p>Best regards,<br>The UltimaLearning Team</p>
          
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #999;">You received this email because you signed up for UltimaLearning.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (user, resetLink) => {
  if (!transporter) {
    console.log(`[DEV] Would send password reset email to ${user.email}`);
    return;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@ultimalearning.com",
      to: user.email,
      subject: "Reset Your UltimaLearning Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">Reset Your Password</h1>
          
          <p>Hi ${user.name},</p>
          
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          
          <p>
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Reset Password
            </a>
          </p>
          
          <p>This link will expire in 1 hour.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The UltimaLearning Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};
