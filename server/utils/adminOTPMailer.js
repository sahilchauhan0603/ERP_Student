const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAdminOtpMail(to, otp) {
  const mailOptions = {
    from: `"BPIT Admin Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Admin Portal OTP Verification',
    html: `
      <div style="max-width:480px;margin:32px auto;padding:32px 24px;background:linear-gradient(135deg,#e0e7ff 0%,#f3e8ff 100%);border-radius:18px;box-shadow:0 4px 24px rgba(80,80,180,0.10);font-family:'Segoe UI',Arial,sans-serif;">
        <div style="text-align:center;margin-bottom:18px;">
          <img src="https://admissions-enquiry.bpitindia.ac.in/wp-content/uploads/2023/07/BPIT-logo.jpg" alt="BPIT Logo" style="height:48px;margin-bottom:8px;"/>
          <h2 style="color:#3730a3;font-size:1.5rem;margin:0 0 8px 0;">BPIT Admin Portal</h2>
          <p style="color:#4b5563;font-size:0.95rem;margin:0;">Secure Access Verification</p>
        </div>
        
        <div style="background:#fff;border-radius:12px;padding:24px 16px;text-align:center;box-shadow:0 2px 8px rgba(80,80,180,0.07);">
          <p style="font-size:1.1rem;color:#444;margin-bottom:12px;">Your Admin Portal verification code is:</p>
          <div style="font-size:2.2rem;font-weight:bold;letter-spacing:0.25em;color:#4f46e5;margin:12px 0 18px 0;padding:8px 0;background:#f5f3ff;border-radius:8px;">${otp}</div>
          <p style="color:#6b7280;font-size:1rem;margin-bottom:0;">
            This code expires in <b>5 minutes</b>.<br/>
            <span style="color:#dc2626;font-weight:500;">Do not share this code with anyone.</span>
          </p>
        </div>
        
        <div style="margin-top:24px;text-align:center;color:#6b7280;font-size:0.95rem;border-top:1px solid #e5e7eb;padding-top:16px;">
          <p style="margin:0 0 8px 0;">For security reasons, this email was sent to ${to}</p>
          <p style="margin:0;font-size:0.95rem;">&copy; ${new Date().getFullYear()} BPIT Admin Portal. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Your BPIT Admin Portal verification code is: ${otp}\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nIf you didn't request this, please contact IT support immediately.`
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Admin OTP email error:', err);
    return false;
  }
}

module.exports = sendAdminOtpMail;