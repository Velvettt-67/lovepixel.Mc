import { SITE_CONFIG } from './siteData';

export interface PayoutProof {
  id: string;
  transactionRef: string;
  recipientHandle: string;
  eventTitle: string;
  amount: string;
  date: string;
  paymentMethod: "UPI" | "Gift Card" | "Direct Transfer";
  status: "Verified & Dispatched";
  verificationNote: string;
}

export const PAYOUT_METRICS = {
  totalRewards: SITE_CONFIG.stats.totalRewardsDistributed,
  totalRewardsNumeric: SITE_CONFIG.stats.totalRewardsNumeric,
  verifiedWinners: SITE_CONFIG.stats.verifiedWinnersCount,
  verifiedWinnersNumeric: SITE_CONFIG.stats.verifiedWinnersNumeric,
  successRate: SITE_CONFIG.stats.successfulPayoutRate,
  eventsRewarded: SITE_CONFIG.stats.eventsRewardedCount,
  eventsRewardedNumeric: SITE_CONFIG.stats.eventsRewardedNumeric,
  adminMessage: SITE_CONFIG.adminMessage,
  adminSignoff: SITE_CONFIG.adminSignoff
};

export const RECENT_VERIFIED_PAYOUTS: PayoutProof[] = [
  {
    id: "tx-2026-041",
    transactionRef: "LPX-UPI-**8492",
    recipientHandle: "mir***_art",
    eventTitle: "Midsummer Botanical Art Showcase",
    amount: "₹5,000",
    date: "March 28, 2026",
    paymentMethod: "UPI",
    status: "Verified & Dispatched",
    verificationNote: "Community vote winner — 1st Place Visuals"
  },
  {
    id: "tx-2026-042",
    transactionRef: "LPX-UPI-**3920",
    recipientHandle: "sol***_tunes",
    eventTitle: "Late Night Lo-Fi Composition Salon",
    amount: "₹3,500",
    date: "April 02, 2026",
    paymentMethod: "UPI",
    status: "Verified & Dispatched",
    verificationNote: "Curators' Pick — Ambient Sound Design"
  },
  {
    id: "tx-2026-043",
    transactionRef: "LPX-UPI-**9114",
    recipientHandle: "kai***_lens",
    eventTitle: "Seasonal 35mm Film Still Exhibition",
    amount: "₹3,500",
    date: "April 05, 2026",
    paymentMethod: "UPI",
    status: "Verified & Dispatched",
    verificationNote: "Member Choice — Film Grain & Dusk"
  },
  {
    id: "tx-2026-044",
    transactionRef: "LPX-UPI-**7703",
    recipientHandle: "noo***_words",
    eventTitle: "Spring Poetry & Short Fiction Salon",
    amount: "₹2,500",
    date: "April 07, 2026",
    paymentMethod: "UPI",
    status: "Verified & Dispatched",
    verificationNote: "Literary Salon Champion"
  }
];

export const PAYOUT_FAQ = [
  {
    q: "How are winners rewarded?",
    a: "Winners receive prizes directly through verified UPI, digital cards, or international transfer within 48 hours of event completion."
  },
  {
    q: "How can I verify a transaction?",
    a: "Every transaction reference is verified and logged in our Discord #giveaways channel and audited by staff admins."
  },
  {
    q: "How do I claim an event reward?",
    a: "Open a support ticket in Discord within 7 days of the winner announcement. You will receive an immediate response from a senior caretaker."
  }
];
