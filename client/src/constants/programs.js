export const PROGRAMS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 197,
    priceDisplay: '$197',
    paymentType: 'one-time',
    paymentOptions: [
      {
        type: 'one-time',
        label: 'One-time payment',
        amount: 197,
        display: '$197',
      },
    ],
    features: [
      '"The Middleman Blueprint" digital guide',
      '2-hour training tutorial on how the business model works',
      'Step-by-step workbook templates',
    ],
    description: 'Perfect for DIY learners who want to set it up themselves',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 2488,
    priceDisplay: '$2,488',
    paymentType: 'flexible',
    paymentOptions: [
      {
        type: 'one-time',
        label: 'Pay in full',
        amount: 2488,
        display: '$2,488',
      },
      {
        type: 'split',
        label: '2 monthly payments',
        amount: 1250,
        display: '2 × $1,250',
        totalAmount: 2500,
        installments: 2,
      },
    ],
    features: [
      'Everything in Basic',
      'Custom middleman business website built for you',
      'Automated deposit & dispatch system setup',
      'Stripe checkout + job board setup',
      'Access to VA and vendor recruiting scripts',
    ],
    description: 'Done-For-You Build-Out',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    price: 4997,
    priceDisplay: '$4,997',
    paymentType: 'flexible',
    paymentOptions: [
      {
        type: 'one-time',
        label: 'Pay in full',
        amount: 4997,
        display: '$4,997',
      },
      {
        type: 'split',
        label: '2 monthly payments',
        amount: 2500,
        display: '2 × $2,500',
        totalAmount: 5000,
        installments: 2,
      },
    ],
    features: [
      'Everything in Pro',
      'Licensing under the official Middleman CEO brand',
      'Private mentorship & weekly check-ins',
      'Branding + marketing templates',
      'Business listed inside the Middleman network for referral jobs',
      'Full automation & scaling roadmap',
    ],
    description: 'Done-For-You + Licensing + VIP Mentorship',
    popular: false,
  },
];

export default PROGRAMS;