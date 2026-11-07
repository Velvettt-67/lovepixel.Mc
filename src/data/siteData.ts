export interface SiteStats {
  membersCount: string;
  membersSubtext: string;
  onlineDailyAverage: string;
  eventsHosted: string;
  eventsSubtext: string;
  totalRewardsDistributed: string;
  totalRewardsNumeric: number;
  verifiedWinnersCount: string;
  verifiedWinnersNumeric: number;
  successfulPayoutRate: string;
  eventsRewardedCount: string;
  eventsRewardedNumeric: number;
}

export interface NavLink {
  label: string;
  path: string;
  badge?: string;
}

export const SITE_CONFIG = {
  name: "LovePixels",
  tagline: "Your Little Corner to Chill.",
  subtagline: "A chill, welcoming Discord community where strangers become memories. Drop in, hang out, share moments, and find your people.",
  discordInviteUrl: "https://discord.gg/kwHcdGg2f",
  discordGuildId: "1498650220215664781",
  adminMessage: `"Thank you for bringing your energy, creativity, and presence to LovePixels. Every reward paid and every quiet evening spent together is a token of our appreciation for making this room feel like home."`,
  adminSignoff: "— LovePixels Staff & Caretakers Team",
  establishedYear: "2025",
  currentYear: "2026",
  stats: {
    membersCount: "15.4k+",
    membersSubtext: "chill members",
    onlineDailyAverage: "2,080+",
    eventsHosted: "50+",
    eventsSubtext: "event reports verified",
    totalRewardsDistributed: "₹2,00,000+",
    totalRewardsNumeric: 200000,
    verifiedWinnersCount: "100+",
    verifiedWinnersNumeric: 100,
    successfulPayoutRate: "100%",
    eventsRewardedCount: "50+",
    eventsRewardedNumeric: 50,
  } as SiteStats,
  navLinks: [
    { label: "Home", path: "/" },
    { label: "Community", path: "/community" },
    { label: "Management", path: "/management" },
    { label: "Events", path: "/events" },
    { label: "Partners", path: "/partners" },
    { label: "Payouts", path: "/payouts" },
    { label: "Gallery", path: "/gallery" },
  ] as NavLink[],
  socials: {
    discord: "https://discord.gg/kwHcdGg2f",
    instagram: "https://instagram.com/lovepixel.community",
    contactEmail: "care@lovepixels.gg",
  }
};
