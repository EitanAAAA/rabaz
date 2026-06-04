export type TeamTier = "lead" | "captain" | "core" | "dev";

export type TeamAccent =
  | "indigo"
  | "sky"
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "fuchsia"
  | "cyan"
  | "orange"
  | "lime"
  | "teal"
  | "pink";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  rank?: string;
  tier: TeamTier;
  accent: TeamAccent;
};

export const TEAM_HEADING = {
  kicker: "ניהול הידע",
  title: "הכירו את הצוות",
  subtitle: "הצוות שמאחורי הפיתוח, התשתיות והחזון של ניהול הידע ברבנות הצבאית"
} as const;

export const TEAM_ROSTER: TeamMember[] = [
  { id: "tzahi", name: "צחי דותן", role: "הבורר", rank: "אל״מ במיל'", tier: "lead", accent: "indigo" },
  { id: "haim", name: "חיים קווה", role: "רת״ח", rank: "ראש תחום", tier: "captain", accent: "sky" },
  { id: "shaniOr", name: "שני אור", role: "חבשנית", tier: "core", accent: "violet" },
  { id: "areil", name: "אראיל פלישבסקי", role: "לצין חסר", tier: "core", accent: "rose" },
  { id: "shlomo", name: "שלמה", role: "GOAT", tier: "core", accent: "amber" },
  { id: "david", name: "דוד", role: "פיליפיני", tier: "core", accent: "emerald" },
  { id: "eitan", name: "איתן קוטנר", role: "AI & Pro UX", tier: "dev", accent: "fuchsia" },
  { id: "liad", name: "ליעד קדוש", role: "Full Stack", tier: "dev", accent: "cyan" },
  { id: "danielR", name: "דניאל רום", role: "מולקולה קטלנית", tier: "dev", accent: "orange" },
  { id: "lior", name: "ליאור קורטריו", role: "מולקולה מטורפת", tier: "dev", accent: "lime" },
  { id: "zohar", name: "זוהר", role: "המפקד כמובן", tier: "dev", accent: "teal" },
  { id: "danielAI", name: "דניאל AI", role: "מפתח AI", tier: "dev", accent: "pink" }
];

export class TeamRoster {
  static all(): TeamMember[] {
    return TEAM_ROSTER;
  }

  static byTier(tier: TeamTier): TeamMember[] {
    return TEAM_ROSTER.filter((m) => m.tier === tier);
  }

  static featured(): TeamMember[] {
    return [...TeamRoster.byTier("lead"), ...TeamRoster.byTier("captain")];
  }

  static squad(): TeamMember[] {
    return [...TeamRoster.byTier("core"), ...TeamRoster.byTier("dev")];
  }
}
