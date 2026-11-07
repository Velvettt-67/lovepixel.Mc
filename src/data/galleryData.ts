export interface GalleryItem {
  id: string;
  title: string;
  artist: string;
  category: "Photography" | "Macro Flora" | "Atmosphere" | "Editorial" | "Celestial Skies";
  image: string;
  aspectRatio: string;
  season: string;
  curatorNotes: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-01",
    title: "Peony Petal Textures in Low Sunlight",
    artist: "Kaia L.",
    category: "Macro Flora",
    image: "/assets/flowers/peony-macro.jpg",
    aspectRatio: "4/5",
    season: "Season 01 Exhibition",
    curatorNotes: "Captured at golden hour on 50mm macro lens. Delicate gradients of dusty rose and cream."
  },
  {
    id: "gal-02",
    title: "Dusk Sky Over Tokyo Rooftops",
    artist: "Sol K.",
    category: "Atmosphere",
    image: "/assets/gallery/sunset-haze.jpg",
    aspectRatio: "16/10",
    season: "Season 01 Exhibition",
    curatorNotes: "Soft pastel dusk gradients fading into dark plum city silhouettes."
  },
  {
    id: "gal-03",
    title: "Morning Light on Linen and Flora",
    artist: "Mira V.",
    category: "Editorial",
    image: "/assets/hero/window-morning.jpg",
    aspectRatio: "16/9",
    season: "Spring Salon Winner",
    curatorNotes: "An intimate scene evoking slow mornings, quiet coffee, and zero digital rush."
  },
  {
    id: "gal-04",
    title: "Silk Waves in Motion",
    artist: "Elena R.",
    category: "Editorial",
    image: "/assets/gallery/silk-waves.jpg",
    aspectRatio: "4/5",
    season: "Season 01 Exhibition",
    curatorNotes: "Fluid tactile motion resembling floating cherry petals and sheer curtains."
  },
  {
    id: "gal-05",
    title: "Translucent Glassware & Twilight Light",
    artist: "Noor A.",
    category: "Photography",
    image: "/assets/gallery/pink-glass.jpg",
    aspectRatio: "3/4",
    season: "Spring Salon Entry",
    curatorNotes: "Study of light refraction and blush pink reflections on clean glass surfaces."
  },
  {
    id: "gal-06",
    title: "Cherry Blossoms Against the Quiet Evening",
    artist: "Ren S.",
    category: "Macro Flora",
    image: "/assets/flowers/cherry-blossom.jpg",
    aspectRatio: "16/10",
    season: "Season 01 Exhibition",
    curatorNotes: "Delicate spring branches capturing the quiet beauty of brief blooming seasons."
  },
  {
    id: "gal-07",
    title: "Petals Scattered on Velvet Canvas",
    artist: "Aria M.",
    category: "Macro Flora",
    image: "/assets/flowers/petals-motion.jpg",
    aspectRatio: "4/5",
    season: "Spring Salon Entry",
    curatorNotes: "Organic movement of fallen cherry blossoms floating softly through the breeze."
  },
  {
    id: "gal-08",
    title: "Minimal Dried Botanicals in Studio Light",
    artist: "Koji T.",
    category: "Editorial",
    image: "/assets/flowers/minimal-flora.jpg",
    aspectRatio: "3/4",
    season: "Season 01 Exhibition",
    curatorNotes: "Understated elegance and sculptural forms in warm muted cream and blush."
  },
  {
    id: "gal-09",
    title: "Ethereal Starlight & Celestial Clouds",
    artist: "Aetheria",
    category: "Celestial Skies",
    image: "/assets/hero/dreamy-clouds.jpg",
    aspectRatio: "16/10",
    season: "Celestial Solstice",
    curatorNotes: "Deep teal celestial atmosphere with drifting stardust and luminous cloud crests."
  },
  {
    id: "gal-10",
    title: "Pastel Twilight Horizon in Rose & Azure",
    artist: "Sol K.",
    category: "Celestial Skies",
    image: "/assets/hero/pink-twilight.jpg",
    aspectRatio: "16/9",
    season: "Celestial Solstice",
    curatorNotes: "Harmonious dusk transition where blush-pink clouds soften into deep ethereal sky blue."
  }
];
