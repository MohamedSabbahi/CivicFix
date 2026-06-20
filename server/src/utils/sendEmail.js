const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const sendEmail = async (options) => {
    const info = await transporter.sendMail({
        from: `"CivicFix" <${process.env.GMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    });

    console.log('✅ Auth email sent:', info.messageId, '→', options.email);
    return info;
};

module.exports = sendEmail;
