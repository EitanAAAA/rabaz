import { ProjectItem } from "@/lib/projects/ProjectItem";

export class ProjectsCatalog {
  private readonly items: ProjectItem[];

  constructor(items: ProjectItem[]) {
    this.items = items;
  }

  getAll(): ProjectItem[] {
    return [...this.items];
  }

  getFeatured(): ProjectItem | undefined {
    return this.items.find((item) => item.featured);
  }

  getCount(): number {
    return this.items.length;
  }
}

export const projectsCatalog = new ProjectsCatalog([
  new ProjectItem({
    id: "ravbot",
    name: "רב בוט",
    tagline: "עוזר AI לרבנות הצבאית",
    description:
      "ממשק שיחה חכם, חיפוש ידע מהיר ומענה אישי לחיילים ולמפקדים בכל זמן.",
    category: "ai",
    image: "/projects/5.png",
    logo: "/images/ravbot-logo.png",
    year: "2025",
    featured: true,
    tileSize: "xl",
    tags: ["AI", "צ'אט", "ידע"]
  }),
  new ProjectItem({
    id: "merkaz-haprat",
    name: "מרכז הפרט",
    tagline: "מערכת שעוזרת לפרט ברבנות",
    description:
      "פלטפורמה לטיפול בפניות, מעקב סטטוס וניהול הזכאויות של הפרט מקצה לקצה.",
    category: "platform",
    image: "/projects/1.png",
    logo: "/project-logos/merkaz-haprat.png",
    year: "2024",
    tileSize: "wide",
    tags: ["פורטל", "פניות", "פרט"]
  }),
  new ProjectItem({
    id: "hadran",
    name: "הדרן עליך",
    tagline: "תוכן ולימוד תורני יומי",
    description:
      "מערכת לניהול לימוד יומי, תכנים תורניים וסיומי מסכת לחיילי הרבנות הצבאית.",
    category: "web",
    image: "/projects/6h.png",
    logo: "/project-logos/hadran.png",
    year: "2025",
    tileSize: "tall",
    tags: ["תורה", "לימוד יומי", "תוכן"]
  }),
  new ProjectItem({
    id: "form-246",
    name: "246",
    tagline: "מילוי טופס חללים",
    description:
      "ממשק דיגיטלי מאובטח למילוי, חתימה והעברה של טופס 246 בצורה מסודרת ויעילה.",
    category: "web",
    image: "/projects/8h.png",
    year: "2024",
    tileSize: "tall",
    tags: ["טפסים", "אבטחה", "תהליך"]
  }),
  new ProjectItem({
    id: "ometz",
    name: "אומץ",
    tagline: "מערכת איסוף ותיעוד ממצאים",
    description:
      "תיעוד מובנה של ממצאים מהשטח, ניהול תיקים והפקת דוחות בזמן אמת.",
    category: "platform",
    image: "/projects/7h.png",
    year: "2024",
    tileSize: "tall",
    tags: ["תיעוד", "ממצאים", "דוחות"]
  }),
  new ProjectItem({
    id: "chizuk",
    name: "חיזוק",
    tagline: "מערכת לניהול חללים",
    description:
      "ניהול תיקי חללים, חיבור לכל הגורמים המטפלים ומעקב רציף ברגישות מלאה.",
    category: "platform",
    image: "/projects/4.png",
    logo: "/project-logos/chizuk.png",
    year: "2024",
    tileSize: "wide",
    tags: ["ניהול", "רגישות", "מעקב"]
  }),
  new ProjectItem({
    id: "hazuti",
    name: "הזות״י",
    tagline: "הזמנת סיורים",
    description:
      "תיאום סיורים, ניהול קבוצות, אישורים ולוחות זמנים — מכל קצוות הארגון במקום אחד.",
    category: "web",
    image: "/projects/2.png",
    logo: "/project-logos/hazuti.png",
    year: "2024",
    tileSize: "std",
    tags: ["סיורים", "תיאום", "ניהול"]
  })
]);
