const BRANCHES = ['הלכה', 'כשרות', 'זו"ק', 'לוגיסטיקה', 'רעו"ת', 'משא"ן', 'תוה"ם'];

export default function BranchesCarousel() {
  const items = [...BRANCHES, ...BRANCHES, ...BRANCHES];

  return (
    <div className="adaline-marquee" aria-label="ענפי הרבנות הצבאית">
      <div className="adaline-marquee-track">
        {items.map((branch, index) => (
          <span className="adaline-marquee-item" key={`${branch}-${index}`}>
            {branch}
          </span>
        ))}
      </div>
    </div>
  );
}
