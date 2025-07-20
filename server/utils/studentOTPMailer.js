const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // set in .env
    pass: process.env.EMAIL_PASS, // set in .env
  },
});

async function sendOtpMail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your One-Time Password (OTP) for BPIT Student Login',
    html: `
      <div style="max-width:480px;margin:32px auto;padding:32px 24px;background:linear-gradient(135deg,#e0e7ff 0%,#f3e8ff 100%);border-radius:18px;box-shadow:0 4px 24px rgba(80,80,180,0.10);font-family:'Segoe UI',Arial,sans-serif;">
        <div style="text-align:center;margin-bottom:18px;">
          <img src="https://admissions-enquiry.bpitindia.ac.in/wp-content/uploads/2023/07/BPIT-logo.jpg" alt="BPIT Logo" style="height:48px;margin-bottom:8px;"/>
          <h2 style="color:#3730a3;font-size:1.5rem;margin:0 0 8px 0;">BPIT Student Portal</h2>
        </div>
        <div style="background:#fff;border-radius:12px;padding:24px 16px;text-align:center;box-shadow:0 2px 8px rgba(80,80,180,0.07);">
          <p style="font-size:1.1rem;color:#444;margin-bottom:12px;">Your One-Time Password (OTP) for login is:</p>
          <div style="font-size:2.2rem;font-weight:bold;letter-spacing:0.25em;color:#4f46e5;margin:12px 0 18px 0;">${otp}</div>
          <p style="color:#6b7280;font-size:1rem;margin-bottom:0;">This OTP is valid for <b>5 minutes</b>.<br/>Please do not share it with anyone.</p>
        </div>
        <div style="margin-top:24px;text-align:center;color:#6b7280;font-size:0.95rem;">
          If you did not request this OTP, you can safely ignore this email.<br><br>
          <span style="font-size:0.95rem;">&copy; ${new Date().getFullYear()} Bhagwan Parshuram Institute of Technology</span>
        </div>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
}

module.exports = sendOtpMail;
