export interface StaffRoleDefinition {
  title: string;
  duty: string;
  character: string;
}

export interface StaffApplicationCriteria {
  season: string;
  status: string;
  requirements: string[];
  intakeDates: string;
}

export const STAFF_PHILOSOPHY = {
  headline: "Hosts, not moderators",
  subheadline: "A small team of people who answer quickly, listen carefully, and treat the community like a room they live in too.",
  quote: "Safety is the luxury we protect most. We look for patience before experience.",
  caretakerPillars: [
    {
      title: "Gentle De-escalation",
      duty: "Preserving soft room temperature through quiet private conversations rather than public spectacles.",
      character: "Patience over enforcement"
    },
    {
      title: "Salon Stewardship",
      duty: "Welcoming newcomers into active voice lounges and ensuring no voice goes unheard.",
      character: "Warmth over aloofness"
    },
    {
      title: "Night Watching",
      duty: "Holding space during the 2 AM quiet hours with music curation and cozy listening rooms.",
      character: "Presence over authority"
    }
  ] as StaffRoleDefinition[],
  seasonApplication: {
    season: "Season 02 (Spring / Summer 2026)",
    status: "Applications In Review",
    intakeDates: "Submissions open on the 1st of every quarter",
    requirements: [
      "Active presence in LovePixels for at least 3 weeks",
      "Demonstrated empathy and slow, calm temperament",
      "Passion for music curation, creative critique, or cozy hosting",
      "Zero history of disruptive behavior across Discord communities"
    ]
  } as StaffApplicationCriteria
};
