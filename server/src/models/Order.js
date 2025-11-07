import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  
  // Customer Info (denormalized for easy access)
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  
  // Business Selections
  industry: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  program: {
    type: String,
    required: true,
    enum: ['basic', 'pro', 'elite'],
  },
  programName: {
    type: String,
    required: true,
  },
  
  // Payment Details
  paymentPlan: {
    type: String,
    required: true,
    enum: ['one-time', 'split'],
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  
  // Stripe Details
  stripePaymentIntentId: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'partially_paid', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  
  // Fulfillment Status
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  
  // Split Payment Tracking
  totalAmount: {
    type: Number,
  },
  firstPaymentAmount: {
    type: Number,
  },
  firstPaymentDate: {
    type: Date,
  },
  firstPaymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
  },
  secondPaymentAmount: {
    type: Number,
  },
  secondPaymentDueDate: {
    type: Date,
  },
  secondPaymentDate: {
    type: Date,
  },
  secondPaymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'overdue'],
    default: 'pending',
  },
  secondPaymentIntentId: {
    type: String,
  },
  
  // Auto-charge for split payments
  savedPaymentMethodId: {
    type: String, // Stripe payment method ID for auto-charging
  },
  secondPaymentScheduled: {
    type: Boolean,
    default: false,
  },
  secondPaymentScheduledDate: {
    type: Date,
  },
  secondPaymentError: {
    type: String, // Store error message if auto-charge fails
  },
  secondPaymentRetryCount: {
    type: Number,
    default: 0,
  },
  
  // Tutorial Access
  tutorialAccessGranted: {
    type: Boolean,
    default: true,
  },
  tutorialAccessUrl: {
    type: String,
  },
  
  // Email tracking
  emailsSent: {
    type: Boolean,
    default: false,
  },
  
  // Skool Community
  skoolInviteSent: {
    type: Boolean,
    default: false,
  },
  skoolInviteDate: {
    type: Date,
  },
  
  // Metadata
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes

orderSchema.index({ secondPaymentDueDate: 1 });
orderSchema.index({ 'secondPaymentStatus': 1, 'secondPaymentDueDate': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;