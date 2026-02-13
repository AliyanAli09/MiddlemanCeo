import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';
import dotenv from 'dotenv';
dotenv.config();

// Create SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Optional: Add these for better compatibility
    tls: {
      rejectUnauthorized: false, // Set to true in production with valid SSL
    },
  });
};

/**
 * Email Service
 * Handles all email sending functionality using SMTP
 * Updated with lead capture notifications
 */

// Send confirmation email to customer
export const sendCustomerConfirmation = async (orderData, leadData) => {
  const { orderId, programName, amount, paymentPlan, secondPaymentDueDate } = orderData;
  const { name, email } = leadData;

  // Format second payment date if available
  const formattedSecondPaymentDate = secondPaymentDueDate 
    ? new Date(secondPaymentDueDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  const mailOptions = {
    from: {
      name: 'MiddlemanCEO Team',
      address: process.env.EMAIL_FROM,
    },
    to: email,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `Welcome to MiddlemanCEO! 🎉 Order #${orderId}`,
    text: `
Congratulations, ${name}!

You're Officially a Middleman

Thank you for your purchase! Your order has been confirmed and you're ready to start building your Middleman business.

ORDER DETAILS
-------------
Order Number: #${orderId}
Program: ${programName}
Amount Paid: $${amount}
${paymentPlan === "split" ? `\nNext Payment: $${amount}\nDue Date: ${formattedSecondPaymentDate}\n(Will be automatically charged to your saved payment method)` : ""}

WHAT'S NEXT?
------------
✓ Access your 2-hour tutorial video
✓ Download the Middleman Blueprint guide
✓ Start building your business!

Click here to access your materials: ${process.env.FRONTEND_URL}/tutorial

${paymentPlan === "split" ? `\nIMPORTANT: Your payment method has been saved securely. The second payment of $${amount} will be automatically charged on ${formattedSecondPaymentDate}.\n` : ""}

Need help?
Contact us at support@middlemanceo.com

© ${new Date().getFullYear()} MiddlemanCEO. All rights reserved.

Privacy Policy: ${process.env.FRONTEND_URL}/privacy
Terms of Service: ${process.env.FRONTEND_URL}/terms
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .button { display: inline-block; background: #2563eb; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .checkmark { color: #10b981; font-size: 20px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          a { color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations, ${name}!</h1>
            <p style="font-size: 18px; margin-top: 10px;">You're Officially a Middleman</p>
          </div>
          
          <div class="content">
            <h2>Order Confirmation</h2>
            <p>Thank you for your purchase! Your order has been confirmed and you're ready to start building your Middleman business.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <div class="detail-row">
                <span><strong>Order Number:</strong></span>
                <span>#${orderId}</span>
              </div>
              <div class="detail-row">
                <span><strong>Program:</strong></span>
                <span>${programName}</span>
              </div>
              <div class="detail-row">
                <span><strong>Amount Paid:</strong></span>
                <span style="color: #10b981; font-weight: bold;">$${amount}</span>
              </div>
              ${
                paymentPlan === "split"
                  ? `
              <div class="detail-row">
                <span><strong>Next Payment:</strong></span>
                <span>$${amount}</span>
              </div>
              <div class="detail-row">
                <span><strong>Due Date:</strong></span>
                <span>${formattedSecondPaymentDate}</span>
              </div>
              `
                  : ""
              }
            </div>

            ${
              paymentPlan === "split"
                ? `
            <div class="alert-box">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Auto-Payment Scheduled:</strong><br>
                Your payment method has been saved securely. The second payment of <strong>$${amount}</strong> will be automatically charged on <strong>${formattedSecondPaymentDate}</strong>.
              </p>
            </div>
            `
                : ""
            }
            
            <h3>What's Next?</h3>
            <ul style="line-height: 2;">
              <li><span class="checkmark">✓</span> Access your 2-hour tutorial video</li>
              <li><span class="checkmark">✓</span> Download the Middleman Blueprint guide</li>
              <li><span class="checkmark">✓</span> Start building your business!</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/tutorial" class="button">
                GO TO TUTORIAL
              </a>
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <strong>Need help?</strong><br>
              Contact us at <a href="mailto:support@middlemanceo.com">support@middlemanceo.com</a>
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MiddlemanCEO. All rights reserved.</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/privacy" style="color: #2563eb; text-decoration: none;">Privacy Policy</a> | 
              <a href="${process.env.FRONTEND_URL}/terms" style="color: #2563eb; text-decoration: none;">Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    priority: 'normal',
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    await EmailLog.create({
      orderId,
      recipient: email,
      emailType: 'confirmation',
      subject: mailOptions.subject,
      status: 'sent',
      provider: 'smtp',
      providerMessageId: info.messageId,
    });

    console.log(`✅ Confirmation email sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);

    await EmailLog.create({
      orderId,
      recipient: email,
      emailType: 'confirmation',
      subject: mailOptions.subject,
      status: 'failed',
      provider: 'smtp',
      errorMessage: error.message,
    });

    throw error;
  }
};

// Send notification email to admin
export const sendAdminNotification = async (orderData, leadData) => {
  const { orderId, programName, amount, industry, city, paymentPlan } = orderData;
  const { name, email, phone } = leadData;

  const mailOptions = {
    from: {
      name: 'MiddlemanCEO System',
      address: process.env.EMAIL_FROM,
    },
    to: process.env.ADMIN_EMAIL,
    replyTo: email,
    subject: `New Order: ${programName} - ${name}`,
    text: `
NEW ORDER RECEIVED!

ORDER DETAILS
-------------
Order ID: #${orderId}
Program: ${programName}
Amount: $${amount}
Payment Plan: ${paymentPlan === 'split' ? 'Split (2 payments)' : 'One-time'}

CUSTOMER INFORMATION
--------------------
Name: ${name}
Email: ${email}
Phone: ${phone}

BUSINESS SELECTION
------------------
Industry: ${industry}
City: ${city}

ACTION ITEMS
------------
- Grant tutorial access
- Follow up if needed
- Review customer details
${paymentPlan === 'split' ? '- Monitor second payment in 30 days' : ''}

This is an automated notification from MiddlemanCEO.com
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #111827; }
          a { color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Order Received!</h1>
          </div>
          
          <div class="content">
            <h2>Order Details</h2>
            <div class="info-box">
              <p><span class="label">Order ID:</span> <span class="value">#${orderId}</span></p>
              <p><span class="label">Program:</span> <span class="value">${programName}</span></p>
              <p><span class="label">Amount:</span> <span class="value" style="color: #10b981; font-weight: bold;">$${amount}</span></p>
              <p><span class="label">Payment Plan:</span> <span class="value">${paymentPlan === 'split' ? 'Split (2 payments)' : 'One-time'}</span></p>
            </div>
            
            <h2>Customer Information</h2>
            <div class="info-box">
              <p><span class="label">Name:</span> <span class="value">${name}</span></p>
              <p><span class="label">Email:</span> <span class="value"><a href="mailto:${email}">${email}</a></span></p>
              <p><span class="label">Phone:</span> <span class="value">${phone}</span></p>
            </div>
            
            <h2>Business Selection</h2>
            <div class="info-box">
              <p><span class="label">Industry:</span> <span class="value">${industry}</span></p>
              <p><span class="label">City:</span> <span class="value">${city}</span></p>
            </div>
            
            <h2>Action Items</h2>
            <ul>
              <li>Grant tutorial access to <a href="mailto:${email}">${email}</a></li>
              <li>Follow up if needed</li>
              <li>Review customer details</li>
              ${paymentPlan === 'split' ? '<li><strong>Monitor second payment in 30 days (auto-charge)</strong></li>' : ''}
            </ul>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              This is an automated notification from MiddlemanCEO.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    priority: 'high',
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    await EmailLog.create({
      orderId,
      recipient: process.env.ADMIN_EMAIL,
      emailType: 'notification',
      subject: mailOptions.subject,
      status: 'sent',
      provider: 'smtp',
      providerMessageId: info.messageId,
    });

    console.log(`✅ Admin notification sent`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);

    await EmailLog.create({
      orderId,
      recipient: process.env.ADMIN_EMAIL,
      emailType: 'notification',
      subject: mailOptions.subject,
      status: 'failed',
      provider: 'smtp',
      errorMessage: error.message,
    });

    throw error;
  }
};

/**
 * Send Lead Capture Notification to Admin
 * Sent immediately when someone fills out the landing page form (BEFORE purchase)
 */
export const sendLeadCaptureNotification = async (leadData) => {
  const { name, email, phone, leadId } = leadData;

  const mailOptions = {
    from: {
      name: 'MiddlemanCEO System',
      address: process.env.EMAIL_FROM || 'SUPPORT@MIDDLEMANCEO.COM',
    },
    to: process.env.ADMIN_EMAIL || 'SUPPORT@MIDDLEMANCEO.COM',
    replyTo: email,
    subject: `🎯 New Lead: ${name}`,
    text: `
NEW LEAD CAPTURED!

LEAD INFORMATION
----------------
Lead ID: ${leadId}
Name: ${name}
Email: ${email}
Phone: ${phone}
Captured: ${new Date().toLocaleString('en-US', { 
  dateStyle: 'full', 
  timeStyle: 'short' 
})}

STATUS
------
Lead has viewed the landing page and submitted their contact information.
They will now proceed to view the Blueprint and select a package.

NEXT STEPS
----------
- Monitor if they purchase a package
- Follow up if they don't complete purchase within 24 hours
- Add to email marketing list
- Track their journey through the funnel

This is an automated notification from MiddlemanCEO.com
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .info-box { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #111827; }
          .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          a { color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Lead Captured!</h1>
            <p style="margin: 0; opacity: 0.9;">Someone just filled out the landing page form</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="badge">NEW LEAD</span>
            </div>

            <h2>Lead Information</h2>
            <div class="info-box">
              <p><span class="label">Lead ID:</span> <span class="value">${leadId}</span></p>
              <p><span class="label">Name:</span> <span class="value">${name}</span></p>
              <p><span class="label">Email:</span> <span class="value"><a href="mailto:${email}">${email}</a></span></p>
              <p><span class="label">Phone:</span> <span class="value"><a href="tel:${phone}">${phone}</a></span></p>
              <p><span class="label">Captured:</span> <span class="value">${new Date().toLocaleString('en-US', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
              })}</span></p>
            </div>
            
            <h2>Status</h2>
            <p>✅ Lead has viewed the landing page and submitted their contact information.</p>
            <p>⏳ They will now proceed to view the Blueprint and select a package.</p>
            
            <h2>Next Steps</h2>
            <ul style="line-height: 2;">
              <li>Monitor if they purchase a package</li>
              <li>Follow up if they don't complete purchase within 24 hours</li>
              <li>Add to email marketing list for nurture campaign</li>
              <li>Track their journey through the funnel</li>
            </ul>
            
            <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                💡 <strong>Pro Tip:</strong> Follow up within 1 hour for best conversion rates
              </p>
            </div>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              This is an automated notification from MiddlemanCEO.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    priority: 'high',
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    await EmailLog.create({
      orderId: leadId,
      recipient: process.env.ADMIN_EMAIL,
      emailType: 'lead-capture',
      subject: mailOptions.subject,
      status: 'sent',
      provider: 'smtp',
      providerMessageId: info.messageId,
    });

    console.log(`✅ Lead capture notification sent for ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending lead capture notification:', error);

    await EmailLog.create({
      orderId: leadId,
      recipient: process.env.ADMIN_EMAIL,
      emailType: 'lead-capture',
      subject: mailOptions.subject,
      status: 'failed',
      provider: 'smtp',
      errorMessage: error.message,
    });

    return { success: false, error: error.message };
  }
};

/**
 * Send Second Payment Confirmation
 */
export const sendSecondPaymentConfirmation = async (orderData, leadData) => {
  const { orderId, programName, amount } = orderData;
  const { name, email } = leadData;

  const mailOptions = {
    from: {
      name: 'MiddlemanCEO Team',
      address: process.env.EMAIL_FROM,
    },
    to: email,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `Second Payment Received - Order #${orderId} ✅`,
    text: `
Hi ${name},

Great news! Your second payment has been successfully processed.

PAYMENT DETAILS
---------------
Order Number: #${orderId}
Program: ${programName}
Amount Charged: $${amount}
Status: PAID IN FULL

Your ${programName} is now fully paid and you have complete access to all materials.

Continue your learning at: ${process.env.FRONTEND_URL}/tutorial

Thank you for your business!
MiddlemanCEO Team

Questions? Contact us at support@middlemanceo.com
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            
            <div class="success-box">
              <p style="margin: 0; color: #065f46;">
                <strong>Great news!</strong> Your second payment has been successfully processed.
              </p>
            </div>
            
            <h3>Payment Details</h3>
            <ul>
              <li><strong>Order Number:</strong> #${orderId}</li>
              <li><strong>Program:</strong> ${programName}</li>
              <li><strong>Amount Charged:</strong> $${amount}</li>
              <li><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID IN FULL</span></li>
            </ul>
            
            <p>Your ${programName} is now fully paid and you have complete access to all materials.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/tutorial" class="button">
                CONTINUE LEARNING
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              Thank you for your business!<br>
              <strong>MiddlemanCEO Team</strong>
            </p>
            
            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              Questions? Contact us at <a href="mailto:support@middlemanceo.com">support@middlemanceo.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Second payment confirmation sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending second payment confirmation:', error);
    throw error;
  }
};

/**
 * Send Second Payment Failed Email
 */
export const sendSecondPaymentFailed = async (orderData, leadData) => {
  const { orderId, programName, amount, errorMessage } = orderData;
  const { name, email } = leadData;

  const mailOptions = {
    from: {
      name: 'MiddlemanCEO Team',
      address: process.env.EMAIL_FROM,
    },
    to: email,
    replyTo: process.env.ADMIN_EMAIL,
    subject: `Payment Failed - Action Required - Order #${orderId} ⚠️`,
    text: `
Hi ${name},

We attempted to process your second payment but it failed.

PAYMENT DETAILS
---------------
Order Number: #${orderId}
Program: ${programName}
Amount Due: $${amount}
Reason: ${errorMessage}

ACTION REQUIRED
---------------
Please contact us immediately at support@middlemanceo.com to update your payment method.

We'll be happy to help you complete your payment and ensure continued access to your materials.

Thank you,
MiddlemanCEO Team
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .error-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            
            <div class="error-box">
              <p style="margin: 0; color: #991b1b;">
                <strong>We attempted to process your second payment but it failed.</strong>
              </p>
            </div>
            
            <h3>Payment Details</h3>
            <ul>
              <li><strong>Order Number:</strong> #${orderId}</li>
              <li><strong>Program:</strong> ${programName}</li>
              <li><strong>Amount Due:</strong> $${amount}</li>
              <li><strong>Reason:</strong> ${errorMessage}</li>
            </ul>
            
            <h3>Action Required</h3>
            <p>Please contact us immediately to update your payment method and complete your payment.</p>
            
            <div style="text-align: center;">
              <a href="mailto:support@middlemanceo.com" class="button">
                CONTACT SUPPORT
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              We're here to help you resolve this quickly.<br>
              <strong>MiddlemanCEO Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment failure notification sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending payment failure notification:', error);
    throw error;
  }
};

// Test email connection (optional utility function)
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendCustomerConfirmation,
  sendAdminNotification,
  sendLeadCaptureNotification,
  sendSecondPaymentConfirmation,
  sendSecondPaymentFailed,
  testEmailConnection,
};