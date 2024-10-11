import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IUser } from '../models/userModel';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

interface IMailOptions {
  email: string;
  subject: string;
  message: string;
}

class Email {
  to: string;
  from: string;
  firstName: string;
  url: string;
  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Naveh Brenner <${process.env.EMAIL_FROM}>`;
  }

  newTrasport() {
    if (process.env.NODE_ENV === 'produntion') {
      return 1;
    }

    // dev env - send to mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // activate in gamil 'less secure app' option
    } as SMTPTransport.Options);
  }

  // send mail
  async send(template: string, subject: string) {
    // render HTML based on pug tempalte
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // create transport and send eamil
    await (this.newTrasport() as nodemailer.Transporter).sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (Valid for 10 minuets)',
    );
  }
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

export { sendEmail, Email };
