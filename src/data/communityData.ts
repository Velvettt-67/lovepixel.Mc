export interface CommunityPillar {
  id: string;
  number: string;
  title: string;
  description: string;
  accent: string;
  detail: string;
}

export interface ShowcaseItem {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  aspectRatio: string;
  accentNote: string;
}

export interface DiscordChannelPreview {
  id: string;
  name: string;
  description: string;
  topic: string;
  unreadCount?: number;
  messages: Array<{
    id: string;
    author: string;
    avatar: string;
    roleColor: string;
    time: string;
    content: string;
    attachment?: string;
  }>;
}

export interface DailyRhythmItem {
  time: string;
  title: string;
  description: string;
  period: string;
}

export const COMMUNITY_PILLARS: CommunityPillar[] = [
  {
    id: "soft-by-design",
    number: "01",
    title: "Soft by design",
    description: "A calm, moderated space with warm rules and zero tolerance for noise. Come as you are, stay as long as you like.",
    accent: "Blush Sanctuary",
    detail: "Curated atmospheres where introverts and creatives flourish without the digital chaos."
  },
  {
    id: "creative-circles",
    number: "02",
    title: "Creative circles",
    description: "Weekly salons for artists, photographers and writers — critique that feels like a compliment with directions.",
    accent: "Editorial Craft",
    detail: "Dedicated lounges for live project feedback, portfolio reviews, and collaborative works."
  },
  {
    id: "slow-nights",
    number: "03",
    title: "Slow nights",
    description: "Listening rooms, film clubs and 2 AM conversations. The kind of company that makes a quiet evening feel curated.",
    accent: "Ambient Hours",
    detail: "Curated playlists, lo-fi listening rooms, and warm companions when the world is quiet."
  },
  {
    id: "care-first",
    number: "04",
    title: "Care first",
    description: "A staff team trained in mediation, always reachable, always kind. Safety is the luxury we protect most.",
    accent: "Empathy & Safety",
    detail: "Thoughtful moderation that prioritizes psychological comfort and mutual gentleness."
  },
  {
    id: "rewarded-presence",
    number: "05",
    title: "Rewarded presence",
    description: "Contribution is noticed here. Hosts, moderators and creators receive transparent monthly payouts and perks.",
    accent: "Real Recognition",
    detail: "Verified UPI/gift distribution acknowledging the members who breathe life into the rooms."
  },
  {
    id: "little-rituals",
    number: "06",
    title: "Little rituals",
    description: "Morning check-ins, gratitude threads and seasonal galleries that turn a server into a home.",
    accent: "Daily Heartbeats",
    detail: "Predictable, cozy touchpoints throughout the 24-hour cycle that anchor your day."
  }
];

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 1,
    title: "LovePixels Identity",
    category: "Signature Visual Archive",
    description: "Our signature identity artwork with handwritten typography woven directly into botanical elements.",
    image: "/assets/community/showcase-01-identity.svg",
    aspectRatio: "16/10",
    accentNote: "EDITION 01 • HAND-CRAFTED ARTWORK"
  },
  {
    id: 2,
    title: "Peony Macro Bloom",
    category: "Botanical Sensibility",
    description: "Soft pink petals in macro focus, capturing the tactile tenderness of the LovePixels aesthetic.",
    image: "/assets/flowers/peony-macro.jpg",
    aspectRatio: "4/5",
    accentNote: "EDITION 02 • NATURAL LUXURY"
  },
  {
    id: 3,
    title: "Morning Sunlit Sanctuary",
    category: "Dreamy Atmosphere",
    description: "Gentle morning light filtering through an open window onto soft linens and quiet spaces.",
    image: "/assets/hero/window-morning.jpg",
    aspectRatio: "16/10",
    accentNote: "EDITION 03 • QUIET MORNINGS"
  },
  {
    id: 4,
    title: "Pastel Dusk Sky",
    category: "Atmospheric Horizon",
    description: "Ethereal twilight hues stretching above the city as the community gathers for evening listening salons.",
    image: "/assets/hero/pink-twilight.jpg",
    aspectRatio: "16/9",
    accentNote: "EDITION 04 • TWILIGHT CONVERSATIONS"
  },
  {
    id: 5,
    title: "Petals in Motion",
    category: "Floral Choreography",
    description: "Delicate petals dancing in the soft evening breeze, echoing our gentle rhythm and light touch.",
    image: "/assets/flowers/petals-motion.jpg",
    aspectRatio: "4/5",
    accentNote: "EDITION 05 • GENTLE MOTION"
  },
  {
    id: 6,
    title: "The Warm Circle",
    category: "Community Intimacy",
    description: "Genuine connection in low-light rooms where strangers turn into lifelong confidants.",
    image: "/assets/community/social-circle.jpg",
    aspectRatio: "16/10",
    accentNote: "EDITION 06 • INTIMATE GATHERINGS"
  },
  {
    id: 7,
    title: "Signature Botanical Echo",
    category: "Closing Horizon",
    description: "A lingering, poetic composition that completes the visual journey into LovePixels.",
    image: "/assets/flowers/minimal-flora.jpg",
    aspectRatio: "4/5",
    accentNote: "EDITION 07 • SANCTUARY COMPLETE"
  }
];

export const DISCORD_CHANNELS: DiscordChannelPreview[] = [
  {
    id: "general",
    name: "general",
    description: "Everyday talk, softly moderated.",
    topic: "Quiet banter, cozy thoughts, and gentle evening updates.",
    messages: [
      {
        id: "m1",
        author: "Mira",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        roleColor: "#d3738b",
        time: "20:14",
        content: "the sunset outside my window is doing something unreasonable today 🌸"
      },
      {
        id: "m2",
        author: "Sol",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        roleColor: "#b54a67",
        time: "20:15",
        content: "post it post it post it in ・🍁┆media!"
      },
      {
        id: "m3",
        author: "Kaia",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
        roleColor: "#e8a8b8",
        time: "20:16",
        content: "listening room in 40 mins — bring one song that ruins you softly"
      },
      {
        id: "m4",
        author: "Noor",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
        roleColor: "#9a3b54",
        time: "20:18",
        content: "i have three. is that allowed?"
      },
      {
        id: "m5",
        author: "Mira",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        roleColor: "#d3738b",
        time: "20:19",
        content: "it's deeply encouraged 🩷"
      }
    ]
  },
  {
    id: "vc-lounge",
    name: "vc-lounge",
    description: "Voice salons and ambient listening rooms.",
    topic: "Chill voice discussions, music streaming, and co-working.",
    messages: [
      {
        id: "vc1",
        author: "Aria",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
        roleColor: "#d3738b",
        time: "21:02",
        content: "Hopping into 🎵 Music VC with some new Japanese ambient vinyls."
      },
      {
        id: "vc2",
        author: "Ren",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
        roleColor: "#e8a8b8",
        time: "21:05",
        content: "Joining with muted mic, will be co-sketching beside you."
      }
    ]
  },
  {
    id: "media",
    name: "media",
    description: "Seasonal member photography and art shares.",
    topic: "Visual inspirations, film stills, original artwork, and photography.",
    messages: [
      {
        id: "med1",
        author: "Elena",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
        roleColor: "#b54a67",
        time: "18:40",
        content: "35mm film scan from Kyoto last autumn. Love the dusk grain on this one.",
        attachment: "/assets/flowers/cherry-blossom.jpg"
      }
    ]
  },
  {
    id: "events",
    name: "events",
    description: "Calendar drops and exclusive salon invites.",
    topic: "Official announcements for listening rooms, salons, and giveaways.",
    messages: [
      {
        id: "ev1",
        author: "LovePixels Bot",
        avatar: "/assets/icons/favicon.svg",
        roleColor: "#b54a67",
        time: "12:00",
        content: "📅 Upcoming Salon: Ambient Soundscapes & Late Night Cinema on Saturday at 21:00 IST. RSVP in the thread."
      }
    ]
  },
  {
    id: "giveaways",
    name: "giveaways",
    description: "Verified creator drops and seasonal giveaways.",
    topic: "Transparent creator rewards and monthly community distributions.",
    messages: [
      {
        id: "gw1",
        author: "Staff Team",
        avatar: "/assets/icons/favicon.svg",
        roleColor: "#d3738b",
        time: "15:30",
        content: "Congratulations to our 4 new creative salon winners! Payouts dispatched via verified UPI. Check the /payouts ledger."
      }
    ]
  },
  {
    id: "confession",
    name: "confession",
    description: "Anonymous late-night thoughts and gentle words.",
    topic: "A soft, safe journal for unburdening your heart into the night.",
    messages: [
      {
        id: "cf1",
        author: "Gentle Whisper",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        roleColor: "#e8a8b8",
        time: "02:15",
        content: "I didn't think an online server could feel like stepping into a warm room after a rainstorm, but here we are."
      }
    ]
  },
  {
    id: "gaming",
    name: "gaming",
    description: "Quiet co-op sessions and late-night gaming rooms.",
    topic: "Minecraft builds, Genshin domains, Valorant customs, and cozy browser titles.",
    messages: [
      {
        id: "gm1",
        author: "Koji",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        roleColor: "#b54a67",
        time: "22:30",
        content: "Anyone up for low-stress Minecraft survival in the cherry blossom biome?"
      }
    ]
  }
];

export const DAILY_RHYTHM: DailyRhythmItem[] = [
  {
    time: "08:00",
    period: "Morning",
    title: "Morning check-in",
    description: "A thread for intentions, quiet greetings, and warm coffee as the server wakes."
  },
  {
    time: "14:00",
    period: "Afternoon",
    title: "Focus rooms",
    description: "Silent co-working with soft lo-fi ambience and Pomodoro timers for deep flow."
  },
  {
    time: "21:00",
    period: "Evening",
    title: "Salons",
    description: "Critique circles, live listening rooms, and film clubs with curated soundscapes."
  },
  {
    time: "01:00",
    period: "Night",
    title: "Late lounge",
    description: "Low-light, whisper-soft conversation that flows effortlessly until sleep arrives."
  }
];
