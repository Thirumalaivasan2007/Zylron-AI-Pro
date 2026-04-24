const nodemailer = require('nodemailer');

const sendLoginNotification = async (userData) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Zylron Security" <${process.env.EMAIL_USER}>`,
            to: 'thirumalaivasan944@gmail.com',
            subject: '🚨 New Login Detected on Zylron AI',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #10b981;">New Login Alert</h2>
                    <p>A user has just logged into your application:</p>
                    <ul>
                        <li><strong>Name:</strong> ${userData.name || 'Unknown'}</li>
                        <li><strong>Email:</strong> ${userData.email}</li>
                        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    <hr />
                    <p style="font-size: 12px; color: #666;">This is an automated security alert from your Zylron Cloud Engine.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Login notification email sent to admin.');
    } catch (error) {
        console.error('Error sending login notification:', error);
    }
};

module.exports = { sendLoginNotification };
