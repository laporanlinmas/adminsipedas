import React from "react";

interface StatCardProps {
  colorClass: "cb" | "cr" | "cg" | "ca" | "cp";
  icon: string;
  value: string | number;
  label: string;
}

export function StatCard({ colorClass, icon, value, label }: StatCardProps) {
  return (
    <div className={`scard ${colorClass}`}>
      <div className="sico">
        <i className={`fas ${icon}`} />
      </div>
      <div className="snum">{value}</div>
      <div className="slbl">{label}</div>
    </div>
  );
}

interface PanelProps {
  title: string;
  icon: string;
  iconColor?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  noMargin?: boolean;
}

export function Panel({ title, icon, iconColor, extra, children, noMargin }: PanelProps) {
  return (
    <div className="panel" style={noMargin ? { marginBottom: 0 } : undefined}>
      <div className="phd">
        <span className="ptl">
          <i className={`fas ${icon}`} style={iconColor ? { color: iconColor } : undefined} /> {title}
        </span>
        {extra}
      </div>
      <div className="pbd">{children}</div>
    </div>
  );
}
