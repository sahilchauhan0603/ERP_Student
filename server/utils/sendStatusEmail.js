const { transporter } = require('../config/mailer');

async function sendStatusEmail(to, subject, html) {
  const mailOptions = {
    from: `"BPIT Admissions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: html.replace(/<[^>]*>/g, ''), // Fallback text version
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

module.exports = sendStatusEmail;