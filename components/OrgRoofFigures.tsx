import Image from "next/image";

const FIGURES = [
  { src: "/org-portraits/ravtzar.png", alt: "הרב הצבאי הראשי", role: "רבצ״ר" },
  { src: "/org-portraits/ramat.png", alt: "ראש מטה הרבנות", role: "רמ״ט" },
  { src: "/org-portraits/ramach.png", alt: "ראש מחלקת הרבנות", role: "רמ״ח" },
  { src: "/org-portraits/unit-commander.png", alt: "מפקד היחידה", role: "מפקד יחידה" }
] as const;

export default function OrgRoofFigures() {
  return (
    <div className="org-roof-figures" aria-hidden="true">
      {FIGURES.map((figure) => (
        <div key={figure.role} className="org-roof-figures__person">
          <Image
            src={figure.src}
            alt={figure.alt}
            width={520}
            height={520}
            className="org-roof-figures__image"
            priority
          />
        </div>
      ))}
    </div>
  );
}
