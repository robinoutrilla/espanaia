/* ═══════════════════════════════════════════════════════════════════════════
   La Moncloa — Composición del Gobierno de España
   Scrapes the official government composition page.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, fetchText, slugify, stripMarkup } from "./utils.js";

const GOBIERNO_URL = "https://www.lamoncloa.gob.es/gobierno/composiciondelgobierno/Paginas/index.aspx";

export interface GobiernoMember {
  slug: string;
  name: string;
  role: string;
  ministry?: string;
  imageUrl?: string;
  profileUrl?: string;
}

export interface GobiernoSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  members: GobiernoMember[];
}

export async function fetchGobiernoComposition(): Promise<GobiernoSnapshot> {
  const html = await fetchText(GOBIERNO_URL);
  const members: GobiernoMember[] = [];

  // Extract minister blocks — La Moncloa uses structured divs with role + name
  // Pattern: <h3 or h4 class contains role title> followed by name
  const ministerPattern =
    /<div[^>]*class="[^"]*ministro[^"]*"[^>]*>[\s\S]*?<(?:h[234]|p|span)[^>]*class="[^"]*cargo[^"]*"[^>]*>([\s\S]*?)<\/(?:h[234]|p|span)>[\s\S]*?<(?:h[234]|p|span|a)[^>]*class="[^"]*nombre[^"]*"[^>]*>([\s\S]*?)<\/(?:h[234]|p|span|a)>/gi;

  for (const match of html.matchAll(ministerPattern)) {
    const role = stripMarkup(match[1]);
    const name = stripMarkup(match[2]);
    if (role && name) {
      members.push({
        slug: slugify(name),
        name,
        role,
      });
    }
  }

  // Fallback: try a more generic pattern if the specific one didn't work
  if (members.length === 0) {
    // Try extracting from structured list items
    const genericPattern =
      /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/gi;

    for (const match of html.matchAll(genericPattern)) {
      const profileUrl = match[1];
      const imageUrl = match[2];
      const name = cleanWhitespace(match[3]);
      const role = cleanWhitespace(match[4]);
      if (name && role && name.length > 3) {
        members.push({
          slug: slugify(name),
          name,
          role,
          imageUrl: imageUrl?.startsWith("http") ? imageUrl : undefined,
          profileUrl: profileUrl?.startsWith("http") ? profileUrl : `https://www.lamoncloa.gob.es${profileUrl}`,
        });
      }
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: GOBIERNO_URL,
    members,
  };
}
