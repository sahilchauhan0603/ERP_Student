const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text, html) {
  const msg = {
    from: `"BPIT Admissions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text
  };
  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

module.exports = sendEmail;