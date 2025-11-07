import cron from 'node-cron';
import { processScheduledPayments } from '../services/autoChargeService.js';

/**
 * Run daily at 9 AM to process scheduled payments
 */
export const startPaymentCronJob = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🕐 Running scheduled payment processor...');
    try {
      await processScheduledPayments();
      console.log('✅ Scheduled payments processed successfully');
    } catch (error) {
      console.error('❌ Error in payment cron job:', error);
    }
  });

  console.log('✅ Payment cron job started (runs daily at 9 AM)');
};

export default startPaymentCronJob;