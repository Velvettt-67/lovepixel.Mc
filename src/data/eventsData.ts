export interface CommunityEvent {
  id: string;
  title: string;
  category: "Music VC" | "Listening Room" | "Creative Salon" | "Film Club" | "Gaming Night" | "Seasonal Gala";
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  status: "Upcoming" | "Active" | "Archived";
  attendees: string;
}

export const EVENTS_DATA: CommunityEvent[] = [
  {
    id: "event-01",
    title: "Midsummer Night",
    category: "Music VC",
    date: "Saturday, Oct 17",
    time: "21:00 IST / 15:30 UTC",
    location: "🎵 Music VC",
    description: "An intimate listening circle of slow tape loops, Japanese ambient vinyls, curated playlists, and relaxed late-night music sessions.",
    image: "/assets/events/music-console.png",
    status: "Upcoming",
    attendees: "42 RSVP'd"
  },
  {
    id: "event-02",
    title: "Quarterly 35mm & Floral Photo Salon",
    category: "Creative Salon",
    date: "Wednesday, Oct 21",
    time: "20:30 IST / 15:00 UTC",
    location: "🌸 voice-salon-1 & ・🍁┆media",
    description: "Community showcase of seasonal film scans, botanical macros, and delicate color grading critique.",
    image: "/assets/events/pixel-camera.png",
    status: "Upcoming",
    attendees: "35 RSVP'd"
  },
  {
    id: "event-03",
    title: "Weekend Film Night",
    category: "Film Club",
    date: "Sunday, Oct 25",
    time: "22:00 IST / 16:30 UTC",
    location: "☕ chill-lounge Screen 01",
    description: "Synchronized film stream followed by quiet discussion on craftsmanship, writing, and dreams.",
    image: "/assets/events/pixel-computer-moon.png",
    status: "Upcoming",
    attendees: "68 RSVP'd"
  },
  {
    id: "event-04",
    title: "Squad Up & Play",
    category: "Gaming Night",
    date: "Friday, Nov 02",
    time: "21:30 IST / 16:00 UTC",
    location: "🎮 gaming-vc-hub",
    description: "Casual multiplayer gaming sessions, Minecraft realms, controllers, and cozy late-night lobbies.",
    image: "/assets/events/pixel-controller.png",
    status: "Upcoming",
    attendees: "29 RSVP'd"
  }
];

export const PAST_EVENTS_ARCHIVE = [
  {
    title: "Spring Equinox Creative Awards",
    category: "Seasonal Gala",
    date: "Spring 2026",
    payoutDisbursed: "₹25,000",
    recap: "Celebrated 18 community artists across photography, short poetry, and soundtrack curation."
  },
  {
    title: "Lofi Beats & Silent Study Marathon",
    category: "Listening Room",
    date: "Winter 2025",
    payoutDisbursed: "₹15,000",
    recap: "Over 72 hours of uninterrupted ambient focus rooms with rotating community DJs."
  }
];
