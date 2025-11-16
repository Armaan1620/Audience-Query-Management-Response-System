import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import httpClient from '../httpClient.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

async function sendEmail({
  from = process.env.EMAIL_FROM || 'sender@example.com',
  to = process.env.EMAIL_TO || 'ingestion@example.com',
  subject = 'Test Email Query',
  body = 'This is a test email message for the query management system.',
  customerName,
  customerEmail,
  priority = 'medium',
} = {}) {
  try {
    const mailOptions = {
      from,
      to,
      subject,
      text: body,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${info.messageId}`);
    } catch (emailError) {
      console.warn(`⚠️  Email sending failed (continuing with query creation): ${emailError.message}`);
    }

    const queryPayload = {
      channel: 'email',
      subject,
      message: body,
      customerName: customerName || from.split('@')[0],
      customerEmail: customerEmail || from,
      priority,
      tags: [],
    };

    const response = await httpClient.post('/queries', queryPayload);
    console.log(`✅ Query created: ${response.data.data.id}`);

    return { queryId: response.data.data.id };
  } catch (error) {
    console.error('❌ Error in sendEmail:', error.message);
    throw error;
  }
}


export default sendEmail;
