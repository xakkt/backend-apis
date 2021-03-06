const admin = require('../../firebase-config');
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
exports.firebase = async (req, res) => {
    try {
        const registrationToken = req.body.registrationToken
        const message = req.body.message
        const options = {
            priority: 'high',
            timeToLive: 60 * 60 * 24, // 1 day
        };
        var payload = {
            notification: {
                title: 'Testing',
                body: 'Testing',
            },
            data: {
                push_type: "1",
            },
            notification: {
                body: "This is a message from FCM to web",
                requireInteraction: "true",

            }
            // }
        }
        admin.messaging().sendToDevice(registrationToken, payload, options)
            .then(response => {
                return res.status(200).json({ message: "Notification sent successfully", data: response })
            })
            .catch(error => {
                console.log(error);
            })
    }
    catch (err) {
        console.log('errr', err);

    }
}