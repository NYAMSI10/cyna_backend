import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import * as nodemailer from 'nodemailer';

config();
@Injectable()
export class SendEmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: 2525,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASSWORD!,
    },
  });

  private encodeUrlParam(value: string): string {
    return encodeURIComponent(value);
  }

  async sendVerificationCode(email: string, code: string) {
    const mailOptions = {
      from: 'cyna@gmail.com',
      to: email,
      subject: 'Verification Code',
      text: `Voici votre code de confirmation : ${code}. Il expire dans 5 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendMailConfirmation(email: string, token: string) {
    const confirmationUrl = `http://localhost:4200/email-confirmation?confirmation=${this.encodeUrlParam(token)}`;
    const mailOptions = {
      from: 'no-reply@woodpartners.fr',
      to: email,
      subject: 'Bienvenue sur Woodpartners',
      text: `Pour finaliser votre inscription, ouvrez ce lien : ${confirmationUrl}`,
      html: `<h1>Bienvenue sur Woodpartners</h1>
      <p>Bonjour,</p>
      <p>Nous sommes ravis de vous accueillir sur notre plateforme.</p>
      <p>Pour finaliser votre inscription, utilisez le lien de confirmation présent dans la version texte de cet email.</p>
      <p>Merci de nous avoir choisis !</p>
      <p>Cordialement,</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async confirmedEmail(email: string, token: string) {
    const confirmationUrl = `http://localhost:3000/api/auth/email-confirmation?token=${this.encodeUrlParam(token)}`;
    const mailOptions = {
      from: 'no-reply@eduguide.com',
      to: email,
      subject: 'Bienvenue sur EduGuide',
      text: `Pour finaliser votre inscription, ouvrez ce lien : ${confirmationUrl}`,
      html: `<h1>Bienvenue sur EduGuide</h1>
      <p>Bonjour,</p>
      <p>Nous sommes ravis de vous accueillir sur notre plateforme.</p>
      <p>Pour finaliser votre inscription, utilisez le lien de confirmation présent dans la version texte de cet email.</p>
      <p>Merci de nous avoir choisis !</p>
      <p>Cordialement,</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendResetPassword(email: string, token: string) {
    const resetUrl = `http://localhost:4200/change-password?token=${this.encodeUrlParam(token)}`;
    const mailOptions = {
      from: 'no-reply@woodpartners.fr',
      to: email,
      subject: 'Reinitialiser votre mot de passe',
      text: `Pour reinitialiser votre mot de passe, ouvrez ce lien : ${resetUrl}`,
      html: `<h1>Reinitialiser votre mot de passe</h1>
      <p>Bonjour,</p>
      <p>Vous avez demandé de reinitialiser votre mot de passe sur notre plateforme.</p>
      <p>Utilisez le lien de reinitialisation présent dans la version texte de cet email.</p>
     
      <p>Cordialement,</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
