import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
