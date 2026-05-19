"use client";

import { useState } from "react";
import RabanutTzvaitOrgChart from "@/components/RabanutTzvaitOrgChart";

type BoardSide = "left" | "right";

function ChartBoard({
  side,
  title,
  variant,
  badge,
  selected,
  onSelect,
  onClear
}: {
  side: BoardSide;
  title: string;
  variant: "rabbanut" | "inner";
  badge: string;
  selected: boolean;
  onSelect: () => void;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      className={`split-org-board split-org-board--${side} ${selected ? "is-selected" : ""}`}
      onFocus={onSelect}
      onMouseEnter={onSelect}
      onMouseLeave={onClear}
    >
      <div className="split-org-board-shell">
        <div className="split-org-board-header">
          <span>{title}</span>
        </div>
        <div className="split-org-chart-viewport">
          <RabanutTzvaitOrgChart variant={variant} badge={badge} />
        </div>
      </div>
    </button>
  );
}

export default function OrgChart3DSplitPreview() {
  const [selected, setSelected] = useState<BoardSide | null>(null);

  return (
    <div className="split-org-stage" dir="rtl">
      <div className="split-org-glow" aria-hidden="true" />
      <div className="split-org-eyebrow split-org-eyebrow--left">ויכולתה בחיל הרבנות הצבאית</div>
      <div className="split-org-eyebrow split-org-eyebrow--right">הכירו את תחום ניהול הידע</div>
      <ChartBoard
        side="left"
        title="מבנה הרבנות"
        variant="rabbanut"
        badge="מבנה הרבנות"
        selected={selected === "left"}
        onSelect={() => setSelected("left")}
        onClear={() => setSelected(null)}
      />
      <ChartBoard
        side="right"
        title="מבנה פנימי"
        variant="inner"
        badge=""
        selected={selected === "right"}
        onSelect={() => setSelected("right")}
        onClear={() => setSelected(null)}
      />
    </div>
  );
}
