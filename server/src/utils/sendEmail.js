const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
    },
});

const sendEmail = async (options) => {
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
