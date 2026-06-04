export class BranchItem {
  readonly id: string;
  readonly name: string;
  readonly projects: readonly string[];

  constructor(config: { id: string; name: string; projects: string[] }) {
    this.id = config.id;
    this.name = config.name;
    this.projects = config.projects;
  }

  get projectCount(): number {
    return this.projects.length;
  }

  get projectLabel(): string {
    return this.projectCount === 1 ? "פרויקט" : "פרויקטים";
  }
}
