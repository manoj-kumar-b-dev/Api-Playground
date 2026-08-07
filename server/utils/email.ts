import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (email: string, resetUrl: string) => {

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("==========================================");
    console.log(`[DEV MODE] Password Reset Link for ${email}`);
    console.log(resetUrl)
    console.log("==========================================")
    return
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    await transporter.sendMail({
      from: `API PLAYGROUND ${process.env.SMTP_USER}`,
      to: email,
      subject: `Password Reset Reques`,
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your API Playground account.</p>
        <p>Please click the link below to reset your password. This link is valid for 15 minutes:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
      </div>`

    })
  }
  catch (error) {
    console.log(error)
  }

}
