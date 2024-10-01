import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import catchAsync from './catchAsync';

interface IMailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: IMailOptions) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gamil 'less secure app' option
  } as SMTPTransport.Options);

  // define the email opriotns
  const mailOptions = {
    from: 'Naveh Brenner <navegerc@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send email with nodemailer
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
