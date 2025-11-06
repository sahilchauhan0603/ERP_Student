const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendRegistrationEmail(studentEmail, studentName, studentId) {
  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation - BPIT</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                line-height: 1.7;
            }
            .status-box {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 2px solid #f59e0b;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .status-title {
                font-size: 18px;
                font-weight: 600;
                color: #92400e;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            }
            .status-icon {
                margin-right: 8px;
                font-size: 20px;
            }
            .status-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .status-list li {
                padding: 8px 0;
                color: #92400e;
                font-size: 14px;
                display: flex;
                align-items: center;
            }
            .status-list li:before {
                content: "✓";
                color: #059669;
                font-weight: bold;
                margin-right: 10px;
                font-size: 16px;
            }
            .info-box {
                background-color: #f3f4f6;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            .info-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 10px;
            }
            .info-content {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.6;
            }
            .footer {
                background-color: #f9fafb;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            .footer p {
                margin: 5px 0;
                font-size: 14px;
                color: #6b7280;
            }
            .contact-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
            }
            .contact-info p {
                margin: 3px 0;
                font-size: 13px;
                color: #9ca3af;
            }
            .highlight {
                color: #1e40af;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Bhagwan Parshuram Institute of Technology</h1>
                <p>Student Registration Confirmation</p>
            </div>
            
            <div class="content">
                <div class="greeting">Dear ${studentName},</div>
                
                <div class="message">
                    Thank you for completing your registration with <span class="highlight">Bhagwan Parshuram Institute of Technology</span>. 
                    We're excited to have you join our academic community!
                </div>
                
                <div class="status-box">
                    <div class="status-title">
                        <span class="status-icon">📋</span>
                        Registration Status: Under Review
                    </div>
                    <ul class="status-list">
                        <li>Your application has been successfully submitted</li>
                        <li>All documents have been received and uploaded</li>
                        <li>Your profile is currently under administrative review</li>
                        <li>You will be notified via email once the review is complete</li>
                    </ul>
                </div>
                
                <div class="info-box">
                    <div class="info-title">📝 Registration Details</div>
                    <div class="info-content">
                        <strong>Student ID:</strong> ${studentId}<br>
                        <strong>Email:</strong> ${studentEmail}<br>
                        <strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
                
                <div class="message">
                    <strong>What happens next?</strong><br><br>
                    Our administrative team will review your application and verify all submitted documents. 
                    This process typically takes 2-3 business days. Once approved, you'll receive an email 
                    with your login credentials and next steps for enrollment.
                </div>
                
                <div class="message">
                    If you have any questions or need to update your information, please don't hesitate 
                    to contact our support team at <a href="https://admissions-enquiry.bpitindia.ac.in/" style="color: #1e40af; text-decoration: underline;">https://admissions-enquiry.bpitindia.ac.in/</a>
                </div>
                
                <div class="message">
                    Visit the student portal to access your profile and track your application status at 
                    <a href="https://erp-student.bpitindia.com/login" style="color: #1e40af; text-decoration: underline;">https://erp-student.bpitindia.com/login</a>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Bhagwan Parshuram Institute of Technology</strong></p>
                <p>Empowering minds, Building futures</p>
                
                <div class="contact-info">
                    <p>📍 Sector 17, Rohini, Delhi - 110089</p>
                    <p>📧 admissions@bpit.ac.in | 📞 +91-11-2757-XXXX</p>
                    <p>🌐 www.bpit.ac.in</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const msg = {
    to: studentEmail,
    from: `"BPIT Admissions" <${process.env.EMAIL_USER}>`,
    subject: 'Registration Confirmation - Welcome to BPIT! 🎓',
    html: emailTemplate,
    text: `Dear ${studentName},\n\nYour registration (ID: ${studentId}) was successful. Welcome to BPIT!\n\nBest regards,\nBPIT Admissions Team`
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Registration email SendGrid error:', error);
    return false;
  }
}

module.exports = sendRegistrationEmail; 