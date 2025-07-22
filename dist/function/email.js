"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailServices = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailServices {
    static instance;
    transporter = null;
    fromEmail = '';
    constructor() { }
    static getInstance() {
        if (!EmailServices.instance) {
            EmailServices.instance = new EmailServices();
        }
        return EmailServices.instance;
    }
    initialize(config) {
        try {
            this.transporter = nodemailer_1.default.createTransport({
                service: config.service,
                auth: {
                    user: config.user,
                    pass: config.password
                }
            });
            this.fromEmail = config.user;
            console.log('Email service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize email service:', error);
            throw error;
        }
    }
    async sendEmail(options) {
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
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}
exports.EmailServices = EmailServices;
