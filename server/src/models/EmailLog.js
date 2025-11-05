import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  recipient: {
    type: String,
    required: true,
  },
  emailType: {
    type: String,
    required: true,
    enum: ['confirmation', 'notification', 'tutorial-access', 'payment-reminder', 'welcome'],
  },
  subject: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ['sent', 'failed', 'bounced'],
    default: 'sent',
  },
  provider: {
    type: String,
    default: 'sendgrid',
  },
  providerMessageId: {
    type: String,
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
emailLogSchema.index({ orderId: 1 });
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ createdAt: -1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;