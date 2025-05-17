const nodemailer = require('nodemailer');
require('dotenv').config();

// Verify environment variables
if (!process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_PASS (Google App Password) is not set in .env file');
}

if (!process.env.EMAIL_USER) {
  console.error('❌ EMAIL_USER (Gmail address) is not set in .env file');
}

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sender = {
  address: process.env.EMAIL_USER,
  name: "Bilan Plus"
};

const sendEmail = async (to, subject, text, html) => {
  if (!to) {
    return { success: false, error: 'Recipient email is required' };
  }

  const mailOptions = {
    from: sender,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html
  };

  try {
    console.log('📧 Attempting to send email...');
    console.log('From:', sender.address);
    console.log('To:', to);
    console.log('Subject:', subject);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent successfully to ${to}`);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Server response:', error.response);
    }
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
