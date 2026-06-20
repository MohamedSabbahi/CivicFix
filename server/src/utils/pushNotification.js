const axios = require('axios');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendPushNotification(pushToken, title, body) {
    if (!pushToken || !pushToken.startsWith('ExponentPushToken')) return;

    try {
        await axios.post(EXPO_PUSH_URL, {
            to: pushToken,
            title,
            body,
            sound: 'default',
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });
    } catch (err) {
        console.error('Push notification error:', err.message);
    }
}

module.exports = { sendPushNotification };
