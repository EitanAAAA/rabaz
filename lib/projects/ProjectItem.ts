export type ProjectCategory = "ai" | "web" | "mobile" | "platform";
export type ProjectTileSize = "xl" | "wide" | "tall" | "std";

export class ProjectItem {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly category: ProjectCategory;
  readonly image: string;
  readonly logo?: string;
  readonly year: string;
  readonly featured: boolean;
  readonly tags: readonly string[];
  readonly tileSize: ProjectTileSize;

  constructor(config: {
    id: string;
    name: string;
    tagline: string;
    description: string;
    category: ProjectCategory;
    image: string;
    logo?: string;
    year: string;
    featured?: boolean;
    tags: string[];
    tileSize?: ProjectTileSize;
  }) {
    this.id = config.id;
    this.name = config.name;
    this.tagline = config.tagline;
    this.description = config.description;
    this.category = config.category;
    this.image = config.image;
    this.logo = config.logo;
    this.year = config.year;
    this.featured = config.featured ?? false;
    this.tags = config.tags;
    this.tileSize = config.tileSize ?? "std";
  }

  get categoryLabel(): string {
    const labels: Record<ProjectCategory, string> = {
      ai: "בינה מלאכותית",
      web: "אתר ומערכת",
      mobile: "אפליקציה",
      platform: "פלטפורמה"
    };
    return labels[this.category];
  }
}
