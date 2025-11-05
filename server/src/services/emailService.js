import sgMail from "@sendgrid/mail";
import EmailLog from "../models/EmailLog.js";

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Email Service
 * Handles all email sending functionality
 * Updated with spam prevention improvements
 */

// Send confirmation email to customer
export const sendCustomerConfirmation = async (orderData, leadData) => {
  const { orderId, programName, amount, paymentPlan } = orderData;
  const { name, email } = leadData;

  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_FROM,
      name: "MiddlemanCEO Team", // Add sender name
    },
    replyTo: process.env.ADMIN_EMAIL, // Add reply-to
    subject: `Welcome to MiddlemanCEO! 🎉 Order #${orderId}`,
    // Add plain text version (IMPORTANT for spam filters)
    text: `
Congratulations, ${name}!

You're Officially a Middleman

Thank you for your purchase! Your order has been confirmed and you're ready to start building your Middleman business.

ORDER DETAILS
-------------
Order Number: #${orderId}
Program: ${programName}
Amount Paid: $${amount}
${paymentPlan === "split" ? `Next Payment: $${amount} (Due in 30 days)` : ""}

WHAT'S NEXT?
------------
✓ Access your 2-hour tutorial video
✓ Download the Middleman Blueprint guide
✓ Start building your business!

Click here to access your materials: ${process.env.FRONTEND_URL}/tutorial

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
                <span>$${amount} (Due in 30 days)</span>
              </div>
              `
                  : ""
              }
            </div>
            
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
              <a href="${
                process.env.FRONTEND_URL
              }/privacy" style="color: #2563eb; text-decoration: none;">Privacy Policy</a> | 
              <a href="${
                process.env.FRONTEND_URL
              }/terms" style="color: #2563eb; text-decoration: none;">Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Anti-spam headers
    headers: {
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      Importance: "Normal",
    },
    // Disable tracking (improves deliverability)
    trackingSettings: {
      clickTracking: {
        enable: false,
      },
      openTracking: {
        enable: false,
      },
    },
    // Email categories for better organization
    categories: ["order-confirmation", "customer-email"],
  };

  try {
    const response = await sgMail.send(msg);

    // Log email
    await EmailLog.create({
      orderId,
      recipient: email,
      emailType: "confirmation",
      subject: msg.subject,
      status: "sent",
      provider: "sendgrid",
      providerMessageId: response[0].headers["x-message-id"],
    });

    console.log(`✅ Confirmation email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);

    // Log failed email
    await EmailLog.create({
      orderId,
      recipient: email,
      emailType: "confirmation",
      subject: msg.subject,
      status: "failed",
      provider: "sendgrid",
      errorMessage: error.message,
    });

    throw error;
  }
};

// Send notification email to admin
export const sendAdminNotification = async (orderData, leadData) => {
  const { orderId, programName, amount, industry, city } = orderData;
  const { name, email, phone } = leadData;

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: {
      email: process.env.EMAIL_FROM,
      name: "MiddlemanCEO System",
    },
    replyTo: email, // Reply goes to customer
    subject: `New Order: ${programName} - ${name}`,
    // Plain text version
    text: `
NEW ORDER RECEIVED!

ORDER DETAILS
-------------
Order ID: #${orderId}
Program: ${programName}
Amount: $${amount}

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
            </ul>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              This is an automated notification from MiddlemanCEO.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    headers: {
      "X-Priority": "2",
      "X-MSMail-Priority": "High",
      Importance: "High",
    },
    trackingSettings: {
      clickTracking: {
        enable: false,
      },
      openTracking: {
        enable: false,
      },
    },
    categories: ["admin-notification", "order-alert"],
  };

  try {
    const response = await sgMail.send(msg);

    // Log email
    await EmailLog.create({
      orderId,
      recipient: process.env.ADMIN_EMAIL,
      emailType: "notification",
      subject: msg.subject,
      status: "sent",
      provider: "sendgrid",
      providerMessageId: response[0].headers["x-message-id"],
    });

    console.log(`✅ Admin notification sent`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);

    // Log failed email
    await EmailLog.create({
      orderId,
      recipient: process.env.ADMIN_EMAIL,
      emailType: "notification",
      subject: msg.subject,
      status: "failed",
      provider: "sendgrid",
      errorMessage: error.message,
    });

    throw error;
  }
};

export default {
  sendCustomerConfirmation,
  sendAdminNotification,
};