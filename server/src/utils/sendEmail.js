const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const sendEmail = async (options) => {
    if (!process.env.BREVO_USER || !process.env.BREVO_PASS) {
        throw new Error('Email service not configured (BREVO_USER / BREVO_PASS missing)');
    }

    const info = await transporter.sendMail({
        from: `"CivicFix" <${process.env.BREVO_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    });

    console.log('✅ Auth email sent:', info.messageId, '→', options.email);
    return info;
};

module.exports = sendEmail;
