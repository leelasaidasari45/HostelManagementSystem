import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ''), // Auto-remove spaces from App Password
  },
  tls: {
    rejectUnauthorized: false // Often required for Gmail to work across different hostings
  },
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
});

export const sendResetEmail = async (to, name, resetUrl) => {
  const mailOptions = {
    from: `"easyPG Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset Your easyPG Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Reset Your Password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password for your <strong>easyPG</strong> account. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} easyPG. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendResetOtpEmail = async (to, name, otp) => {
  const mailOptions = {
    from: `"easyPG Support" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Password Reset Code",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">Reset Your Password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password for your <strong>easyPG</strong> account. Enter the following 6-digit code to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8fafc; color: #1e293b; padding: 16px 32px; border-radius: 8px; font-weight: 800; font-size: 32px; letter-spacing: 8px; border: 2px dashed #cbd5e1; display: inline-block;">
            ${otp}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} easyPG. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export const sendLeadNotificationEmail = async (leadName, leadPhone, leadCapacity) => {
  const mailOptions = {
    from: `"easyPG Lead Capture" <${process.env.SMTP_USER}>`,
    to: "leelasaidasari@gmail.com",
    subject: "🔥 New Lead Captured - easyPG",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1;">New Lead Form Submission</h2>
        <p>A new potential customer has filled out the lead form on the landing page!</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${leadName}</p>
          <p style="margin: 5px 0;"><strong>Mobile:</strong> ${leadPhone}</p>
          <p style="margin: 5px 0;"><strong>Hostel Capacity:</strong> ${leadCapacity || 'N/A'} beds</p>
        </div>
        <p>Log in to your admin dashboard to see all leads.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} easyPG. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Lead notification email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending lead notification email:", error);
  }
};
