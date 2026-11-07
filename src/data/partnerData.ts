export interface PartnerCommunity {
  id: string;
  name: string;
  description: string;
  focus: string;
  members: string;
  inviteNote: string;
}

export const PARTNER_PHILOSOPHY = {
  headline: "Company we keep",
  subheadline: "We partner slowly. Each community here shares our standards for moderation, warmth and craft.",
  collaborationDetails: "We host two cross-community evenings a month. Tell us about your room and we'll find a date.",
  standards: [
    "Zero tolerance for toxicity, trolling, or aggressive spam",
    "Active human moderation and caring server leadership",
    "Curated aesthetic focus or dedicated creative/philosophical interest",
    "Reciprocal cross-salon evenings and listening rooms"
  ]
};

export const PARTNER_COMMUNITIES: PartnerCommunity[] = [
  {
    id: "atelier-nocturne",
    name: "Atelier Nocturne",
    description: "A sanctuary for midnight illustrators, comic artists, and concept painters.",
    focus: "Visual Arts & Illustration",
    members: "2.8k members",
    inviteNote: "Regular co-hosts of our Friday Sketch Salons"
  },
  {
    id: "ambient-tape-archive",
    name: "Tape Archive Collective",
    description: "Analog tape enthusiasts, modular synth artists, and ambient sound designers.",
    focus: "Sound & Music Production",
    members: "1.9k members",
    inviteNote: "Curators of our 24/7 Study & Vinyl VC stream"
  },
  {
    id: "film-and-grain",
    name: "Grain & Solitude",
    description: "Curated 35mm / 120mm film photography salon and darkroom enthusiasts.",
    focus: "Analog Photography",
    members: "3.2k members",
    inviteNote: "Seasonal judges for our botanical photo gallery"
  }
];
