import { BranchItem } from "@/lib/branches/BranchItem";

export class BranchesCatalog {
  private readonly items: BranchItem[];

  constructor(items: BranchItem[]) {
    this.items = items;
  }

  getAll(): BranchItem[] {
    return [...this.items];
  }

  getCount(): number {
    return this.items.length;
  }

  // Sum of all projects delivered across every branch.
  getTotalProjects(): number {
    return this.items.reduce((sum, item) => sum + item.projectCount, 0);
  }
}

export const branchesCatalog = new BranchesCatalog([
  new BranchItem({ id: "zuk", name: "זו״ק", projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳", "פרויקט ד׳"] }),
  new BranchItem({ id: "kashrut", name: "כשרות", projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳"] }),
  new BranchItem({ id: "prat", name: "פרט", projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳"] }),
  new BranchItem({ id: "halacha", name: "הלכה", projects: ["פרויקט א׳"] }),
  new BranchItem({ id: "giyur", name: "גיור", projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳"] }),
  new BranchItem({
    id: "reut",
    name: "רעו״ת",
    projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳", "פרויקט ד׳", "פרויקט ה׳"]
  }),
  new BranchItem({ id: "maashan", name: "משא״ן", projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳", "פרויקט ד׳"] }),
  new BranchItem({
    id: "toham",
    name: "תוה״ם",
    projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳", "פרויקט ד׳", "פרויקט ה׳"]
  }),
  new BranchItem({ id: "tipuach", name: "טיפו״ח", projects: ["פרויקט א׳", "פרויקט ב׳", "פרויקט ג׳"] })
]);
