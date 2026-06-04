import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function registerLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

export function scrollToSection(target: string): void {
  if (typeof document === "undefined") return;
  const element = document.querySelector<HTMLElement>(target);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY;
  if (lenisInstance) {
    lenisInstance.scrollTo(top, { duration: 1.25, force: true });
  } else {
    window.scrollTo({ top, behavior: "smooth" });
  }
}
