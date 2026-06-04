import BranchesShowcaseSection from "@/components/BranchesShowcaseSection";
import HeroScrollVideo from "@/components/HeroScrollVideo";
import OceanFooterSection from "@/components/OceanFooterSection";
import ProjectsShowcaseSection from "@/components/ProjectsShowcaseSection";
import RootsDescentSection from "@/components/RootsDescentSection";
import ScrollCapabilitiesSection from "@/components/ScrollCapabilitiesSection";

const ENDING: "ocean" | "roots" = "roots";

export default function Home() {
  return (
    <main>
      <HeroScrollVideo />
      <ScrollCapabilitiesSection />
      <ProjectsShowcaseSection />
      <BranchesShowcaseSection />
      {ENDING === "roots" ? <RootsDescentSection /> : <OceanFooterSection />}
    </main>
  );
}
