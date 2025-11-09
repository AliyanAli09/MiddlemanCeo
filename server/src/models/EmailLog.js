import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    emailType: {
      type: String,
      required: true,
      enum: [
        'confirmation',      // Customer order confirmation
        'notification',      // Admin order notification
        'lead-capture',      // Admin lead capture notification (NEW)
        'second-payment',    // Second payment notifications
        'payment-failed',    // Payment failure notifications
        'reminder',          // Payment reminders
        'welcome',           // Welcome emails
        'follow-up',         // Follow-up emails
      ],
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['sent', 'failed', 'pending', 'bounced'],
      default: 'pending',
    },
    provider: {
      type: String,
      required: true,
      enum: ['sendgrid', 'smtp', 'other'],
      default: 'sendgrid',
    },
    providerMessageId: {
      type: String,
      sparse: true,
    },
    errorMessage: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ emailType: 1 });
emailLogSchema.index({ recipient: 1 });

// Update sentAt when status changes to 'sent'
emailLogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  next();
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;