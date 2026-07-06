import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string; subject: string; message: string; html?: string }) => {
  // Try mailtrap or other configured SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
      user: process.env.EMAIL_USER || 'mock',
      pass: process.env.EMAIL_PASS || 'mock',
    },
  });

  const mailOptions = {
    from: `"Arbeit Sports" <no-reply@arbeitsports.com>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.email}`);
  } catch (error) {
    console.warn(`Email failed to send. Logger fallback:`);
    console.warn(`TO: ${options.email}`);
    console.warn(`SUBJECT: ${options.subject}`);
    console.warn(`BODY: ${options.message}`);
  }
};
