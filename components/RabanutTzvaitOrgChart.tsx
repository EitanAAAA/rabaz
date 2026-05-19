"use client";

import NextImage from "next/image";

type OrgNode = {
  title: string;
  role: string;
  person: string;
  imageSrc?: string;
  systems?: string[];
};

const chiefRabbi: OrgNode = {
  title: "הרב הצבאי הראשי",
  role: "רבצ״ר",
  person: "תת אלוף הרב איל כרים",
  imageSrc: "/org-portraits/ravtzar.png"
};

const topCommand: OrgNode[] = [
  {
    title: "ראש מטה הרבנות",
    role: "רמ״ט",
    person: "אל״ם הרב שוהם עורקבי",
    imageSrc: "/org-portraits/ramat.png"
  },
  {
    title: "ראש מחלקת הרבנות",
    role: "רמ״ח",
    person: "אל״ם הרב חיים וייסברג",
    imageSrc: "/org-portraits/ramach.png"
  }
];

const unitCommander: OrgNode = {
  title: "מפקד היחידה",
  role: "מפקד יחידה",
  person: "רס״ן אברהם כליפה",
  imageSrc: "/org-portraits/unit-commander.png"
};

const branches: OrgNode[] = [
  {
    title: "זיהוי וקבורה",
    role: "זו״ק",
    person: "סא״ל הרב ניר יפה",
    systems: ["מנת״ץ", "לומדה 246", "חיזו״ק"]
  },
  {
    title: "כשרות",
    role: "ענף כשרות",
    person: "סא״ל הרב נריה ר׳",
    systems: ["בקרת מטבחים", "תעודות", "סיורים"]
  },
  {
    title: "הלכה",
    role: "ענף הלכה",
    person: "סא״ל הרב אריה ה׳",
    systems: ["שו״ת", "פקודות", "מאגר הלכה"]
  },
  {
    title: "משאבי אנוש",
    role: "משא״ן",
    person: "סרן אריה דנה",
    systems: ["דוח 1", "תקינה", "שיבוצים"]
  },
  {
    title: "לוגיסטיקה",
    role: "לוגיסטיקה",
    person: "רס״ן אברהם קליפה",
    systems: ["ציוד", "רכש", "מלאי"]
  },
  {
    title: "ניהול ובקרה",
    role: "ניהול ובקרה",
    person: "סא״ל הרב דדון",
    systems: ["יעדים", "בקרה", "סטטוס"]
  },
  {
    title: "תורה והדרכה מקצועית",
    role: "תוה״ם",
    person: "לא צוין",
    systems: ["הדרכות", "כשירויות", "תיקי ידע"]
  },
  {
    title: "בית הדין לגיור",
    role: "בית הדין לגיור",
    person: "לא צוין",
    systems: ["תיקים", "דיונים"]
  },
  {
    title: "רעות",
    role: "רעו״ת",
    person: "לא צוין",
    systems: ["קהילה", "ליווי", "מענה"]
  }
];

const innerChief: OrgNode = {
  title: "אל״מ במיל",
  role: "הבורר",
  person: "צחי דותן"
};

const innerTopCommand: OrgNode[] = [
  {
    title: "רת״ח",
    role: "רת״ח",
    person: "חיים קווה"
  },
  {
    title: "רע״ן",
    role: "רע״ן",
    person: "הרב דדון"
  }
];

const innerMiddleCommand: OrgNode[] = [
  {
    title: "חבשנית",
    role: "שני אור",
    person: "חבשנית"
  },
  {
    title: "לצין חסר",
    role: "אראיל פלישבסקי",
    person: "לצין חסר"
  },
  {
    title: "GOAT",
    role: "שלמה",
    person: "GOAT"
  },
  {
    title: "פיליפיני",
    role: "דוד",
    person: "פיליפיני"
  }
];

const innerBranches: OrgNode[] = [
  {
    title: "AI ו Pro UX",
    role: "איתן קוטנר",
    person: "מפתח AI ו Pro UX"
  },
  {
    title: "Full Stack",
    role: "ליעד קדוש",
    person: "Full Stack"
  },
  {
    title: "מולקולה קטלנית",
    role: "דניאל רום",
    person: "מולקולה קטלנית"
  },
  {
    title: "מולקולה מטורפת",
    role: "ליאור קורטריו",
    person: "מולקולה מטורפת"
  },
  {
    title: "המפקד כמובן",
    role: "זוהר",
    person: "המפקד כמובן"
  },
  {
    title: "AI",
    role: "דניאל AI",
    person: "מפתח AI"
  }
];

const charts = {
  rabbanut: {
    chief: chiefRabbi,
    top: topCommand,
    unit: unitCommander,
    branches
  },
  inner: {
    chief: innerChief,
    top: innerTopCommand,
    unit: undefined,
    middle: innerMiddleCommand,
    branches: innerBranches
  }
};

function OrgCard({ role, person, imageSrc }: OrgNode) {
  return (
    <div className={`org-card group ${imageSrc ? "org-card--with-image" : ""}`}>
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-zinc-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {imageSrc ? (
        <div className="org-card-image" aria-hidden="true">
          <NextImage src={imageSrc} alt="" width={92} height={92} />
        </div>
      ) : null}

      <div className="org-card-text" dir="rtl">
        <div className="org-card-role">{role}</div>
        <div className="my-1 h-px w-8 bg-zinc-300 transition-all duration-300 group-hover:w-14 group-hover:bg-zinc-500" />
        <div className="org-card-person">{person}</div>
      </div>
    </div>
  );
}

function BranchSystemNode({ branch }: { branch: OrgNode }) {
  return (
    <div className="branch-node">
      <OrgCard {...branch} />
      {branch.systems ? (
        <div className="branch-system-dock" data-system-count={branch.systems.length} aria-label={`מערכות ${branch.role}`}>
          <span className="branch-system-trunk" aria-hidden="true" />
          <span className="branch-system-dot" aria-hidden="true" />
          {branch.systems.map((system) => (
            <div className="branch-system-node" data-count={branch.systems.length} key={system}>
              <span className="branch-system-chip">{system}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Connector({ type = "vertical", className = "" }: { type?: "vertical" | "horizontal"; className?: string }) {
  if (type === "horizontal") {
    return <div className={`org-line mx-auto h-px w-full ${className}`} />;
  }

  return <div className={`org-line mx-auto w-px ${className || "h-5"}`} />;
}

export default function RabanutTzvaitOrgChart({
  variant = "rabbanut",
  badge
}: {
  variant?: "rabbanut" | "inner";
  badge?: string;
}) {
  const chart = charts[variant];
  const middle = "middle" in chart ? chart.middle : undefined;
  const carouselBranches = [...chart.branches, ...chart.branches];

  return (
    <div dir="rtl" className="org-chart pointer-events-auto mx-auto w-full max-w-5xl text-zinc-950">
      <section className="org-chart-panel">
        {badge ? <div className="org-chart-badge">{badge}</div> : null}
        <div className="relative flex justify-center">
          <OrgCard {...chart.chief} />
        </div>

        <Connector className="relative h-5" />
        <Connector type="horizontal" className="relative max-w-lg" />

        <div className="relative w-full max-w-lg pt-4">
          <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2">
            {chart.top.map((item) => (
              <div key={item.role} className="relative">
                <div className="org-line absolute right-1/2 top-[-24px] hidden h-6 w-px translate-x-1/2 md:block" />
                <OrgCard {...item} />
              </div>
            ))}
          </div>

          <div className="mx-auto mt-5 hidden max-w-sm md:block">
            <Connector type="horizontal" />
          </div>

          <div className="hidden md:block">
            <div className="org-line absolute left-1/4 bottom-[-20px] h-5 w-px" />
            <div className="org-line absolute right-1/4 bottom-[-20px] h-5 w-px" />
          </div>
        </div>

        {chart.unit ? (
          <>
            <Connector className="relative h-6" />
            <div className="relative flex justify-center">
              <OrgCard {...chart.unit} />
            </div>
          </>
        ) : null}

        {middle ? (
          <>
            <Connector className="relative h-5" />
            <Connector type="horizontal" className="relative max-w-2xl" />
            <div className="relative w-full max-w-2xl pt-3">
              <div className="grid grid-cols-2 justify-items-center gap-3 lg:grid-cols-4">
                {middle.map((item) => (
                  <div key={item.role} className="relative">
                    <div className="org-line absolute right-1/2 top-[-12px] hidden h-3 w-px translate-x-1/2 lg:block" />
                    <OrgCard {...item} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <Connector className="relative h-3" />
        <Connector type="horizontal" className="relative max-w-3xl" />

        <div className="branch-carousel-window relative -mt-[28px] w-full max-w-3xl pt-3">
          <div className="branch-carousel-track">
            {carouselBranches.map((item, index) => (
              <div key={`${item.role}-${index}`} className="branch-carousel-item relative">
                <div className="org-line absolute right-1/2 top-[-12px] hidden h-3 w-px translate-x-1/2 lg:block" />
                <BranchSystemNode branch={item} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
