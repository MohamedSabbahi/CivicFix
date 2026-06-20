const axios = require('axios');

const sendEmail = async (options) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('Email service not configured (BREVO_API_KEY missing)');
    }

    const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
            sender: { name: 'CivicFix', email: process.env.BREVO_SENDER },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html,
        },
        {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        }
    );

    console.log('✅ Auth email sent via Brevo API →', options.email, response.data);
    return response.data;
};

module.exports = sendEmail;
