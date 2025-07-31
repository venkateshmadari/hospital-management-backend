const otptemplate = (name, otp) => {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #020d1bff; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px;">Hello, ${name}</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                    We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; background-color: #4a90e2; color: #ffffff; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 4px; letter-spacing: 2px;">${otp}</span>
                  </div>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                    This OTP is valid for 5 minutes. If you did not request a password reset, please contact our support team immediately.
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0;">
                    Thank you,<br>
                    My hospital Team
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    &copy; ${currentYear} Your Company. All rights reserved.<br>
                    <a href="https://yourcompany.com/support" style="color: #4a90e2; text-decoration: none;">Contact Support</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`
    ;
    
    
};

module.exports = {
  otptemplate,
};
