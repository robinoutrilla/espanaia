/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { partyColors, politicianPhotos, proxyImg } from "../lib/visual-data";

interface PoliticianCardModel {
  slug: string;
  shortName: string;
  currentRoleSummary: string;
  constituency?: string;
}

interface PoliticianCardProps {
  politician: PoliticianCardModel;
  partySlug: string;
  partyLabel: string;
  territoryLabel: string;
}

export function PoliticianCard({ politician, partySlug, partyLabel, territoryLabel }: PoliticianCardProps) {
  const photoUrl = politicianPhotos[politician.slug];
  const accentColor = partyColors[partySlug] ?? "var(--rojo)";

  return (
    <Link
      className="profile-card"
      href={`/politicians/${politician.slug}`}
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div className="profile-card-top">
        <div className="profile-avatar-row">
          {photoUrl ? (
            <img
              className="profile-avatar"
              src={proxyImg(photoUrl)}
              alt={politician.shortName}
              width={40}
              height={40}
              loading="lazy"
            />
          ) : (
            <span className="profile-avatar-fallback" style={{ background: accentColor }}>
              {politician.shortName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          )}
          <span className="tag tag-party" style={{ background: `${accentColor}22`, color: accentColor }}>
            {partyLabel}
          </span>
        </div>
        <span>{territoryLabel}</span>
      </div>
      <h3>{politician.shortName}</h3>
      <p>{politician.currentRoleSummary}</p>
      <div className="profile-card-footer">
        <span>{politician.constituency ?? territoryLabel}</span>
        <strong>Ficha →</strong>
      </div>
    </Link>
  );
}
