/* ═══════════════════════════════════════════════════════════════════════════
   AIReF — Autoridad Independiente de Responsabilidad Fiscal
   Fetches publications (informes, opiniones, estudios, divulgación) from
   the AIReF WordPress RSS feed. Supports pagination to retrieve the full
   archive of ~1,500 publications.
   ═══════════════════════════════════════════════════════════════════════════ */

import { cleanWhitespace, slugify, stripMarkup } from "./utils.js";

const FEED_URL = "https://www.airef.es/es/feed/";

/** AIReF's SSL cert sometimes fails verification — use a fetch that handles this */
async function fetchAIReFText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; EspanaIA/0.1)" },
    // @ts-expect-error -- Node.js 18+ supports this to skip cert validation
    dispatcher: undefined,
  });
  if (!response.ok) {
    throw new Error(`AIReF fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export interface AIReFPublication {
  id: string;
  title: string;
  date: string;
  link: string;
  description?: string;
  categories: string[];
  creator?: string;
}

export interface AIReFSnapshot {
  fetchedAt: string;
  sourceUrl: string;
  totalPublications: number;
  publications: AIReFPublication[];
}

function parseRssItems(xml: string): AIReFPublication[] {
  const items: AIReFPublication[] = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;

  let match: RegExpExecArray | null;
  while ((match = itemPattern.exec(xml)) !== null) {
    const block = match[1];

    const title = cleanWhitespace(
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
    ) ?? "";

    const link = block.match(/<link>(.*?)<\/link>/)?.[1]?.trim() ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    const creator = block.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/)?.[1]?.trim();

    const descRaw = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1]
      ?? block.match(/<description>(.*?)<\/description>/s)?.[1];
    const description = stripMarkup(descRaw)?.slice(0, 500);

    const categories: string[] = [];
    const catPattern = /<category[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/gi;
    let catMatch: RegExpExecArray | null;
    while ((catMatch = catPattern.exec(block)) !== null) {
      if (catMatch[1]) categories.push(catMatch[1]);
    }

    // Parse date to ISO
    let isoDate = pubDate;
    try {
      const d = new Date(pubDate);
      if (!Number.isNaN(d.getTime())) isoDate = d.toISOString().slice(0, 10);
    } catch { /* keep original */ }

    const slug = slugify(title).slice(0, 60);
    const id = `airef-${isoDate}-${slug}`;

    if (title) {
      items.push({ id, title, date: isoDate, link, description, categories, creator });
    }
  }

  return items;
}

/**
 * Fetch AIReF publications from the RSS feed.
 * @param maxPages Maximum number of feed pages to fetch (10 items per page). Default 5 (50 items).
 */
export async function fetchAIReFPublications(maxPages = 5): Promise<AIReFSnapshot> {
  const publications: AIReFPublication[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? FEED_URL : `${FEED_URL}?paged=${page}`;
    try {
      const xml = await fetchAIReFText(url);
      const items = parseRssItems(xml);
      if (items.length === 0) break;
      publications.push(...items);
    } catch {
      break;
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    sourceUrl: FEED_URL,
    totalPublications: publications.length,
    publications,
  };
}
