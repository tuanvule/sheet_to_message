import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export class EmailServices {
  private static instance: EmailServices;
  private transporter: Transporter | null = null;
  private fromEmail: string = '';

  private constructor() {}

  public static getInstance(): EmailServices {
    if (!EmailServices.instance) {
      EmailServices.instance = new EmailServices();
    }
    return EmailServices.instance;
  }

  public initialize(config: {
    service: string;
    user: string;
    password: string;
  }): void {
    try {
      this.transporter = nodemailer.createTransport({
        service: config.service,
        auth: {
          user: config.user,
          pass: config.password
        }
      });
      
      this.fromEmail = config.user;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not initialized');
      return false;
    }

    const mailOptions = {
      from: this.fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}