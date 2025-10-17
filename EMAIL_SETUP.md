# Email Authentication Setup Guide

This guide will help you configure email-based authentication for your e-commerce application.

## Prerequisites

You need a Gmail account or any SMTP email service to send verification codes to users.

## Gmail Setup (Recommended)

### Step 1: Create an App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down and click on **App passwords**
4. Select **Mail** as the app and **Other** as the device
5. Enter a name (e.g., "E-commerce App") and click **Generate**
6. Copy the 16-character password (this is your app password)

### Step 2: Configure Environment Variables

Add the following variables to your `.env` file in the root directory:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# MongoDB (already configured)
MONGO_URI=your-mongodb-uri

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `your-16-character-app-password` with the app password from Step 1

## Alternative SMTP Services

If you prefer to use another email service provider, update the email service configuration in:
`login/backend/services/emailService.js`

### Example for SendGrid:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Example for Outlook:

```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Testing the Setup

1. Start your backend server:
   ```bash
   cd login/backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd login/frontend
   npm start
   ```

3. Navigate to the login page and try to register with a new email address

4. You should receive a verification code via email within a few seconds

## Troubleshooting

### Email not sending:
- Double-check your Gmail app password
- Ensure 2-Step Verification is enabled on your Google account
- Check that EMAIL_USER and EMAIL_PASS are correctly set in .env
- Review the backend console logs for error messages

### "Account already exists" error:
- This means a user with that email is already registered
- Try logging in instead of registering
- Use a different email address for testing

### Verification code expired:
- Codes expire after 5 minutes
- Click "Resend Code" to receive a new one
- Complete the registration process within the time limit

## Security Notes

- Never commit your `.env` file to version control
- Keep your app passwords secure
- Use strong JWT secrets in production
- Consider implementing rate limiting for sending verification codes
- In production, use a dedicated email service (SendGrid, AWS SES, etc.)

## Features Included

✅ Email-based registration with 6-digit verification code
✅ 5-minute code expiration
✅ Resend code functionality with 60-second cooldown
✅ Password validation (minimum 6 characters)
✅ Secure password storage with bcrypt
✅ Email validation
✅ User-friendly error messages
✅ Multi-step registration flow
✅ Responsive design with Tailwind CSS
