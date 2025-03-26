import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  

// Function to send OTP 
export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  try {
    console.log("Sending OTP...");
    console.log(otp)
    const mailOptions = {
      from: '"PlayBook" <ajmalcvaju1997@gmail.com>',
      to,
      subject: "OTP Verification from PlayBook",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2>OTP Verification</h2>
          <p>Hi,</p>
          <p>Your OTP for verification is: <strong>${otp}</strong></p>
          <p>This OTP is valid only for 5 minutes. Please do not share it with anyone.</p>
          <p>Thank you,<br>The PlayBook Team</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully!");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email.");
  }
};
