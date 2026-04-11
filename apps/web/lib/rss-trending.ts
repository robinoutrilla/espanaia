/* ═══════════════════════════════════════════════════════════════════════════
   RSS Trending — fetch Spanish news feeds, extract headlines, match to
   internal entities (politicians, parties, territories) and link them.
   ═══════════════════════════════════════════════════════════════════════════ */

import { politicians, parties, territories } from "@espanaia/seed-data";
import { persistTrending } from "./rss-store";

// ── Feed definitions ────────────────────────────────────────────────────────

interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: "media" | "institutional" | "agency";
}

const feeds: FeedSource[] = [
  // National newspapers
  { id: "elpais", name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada", category: "media" },
  { id: "elmundo", name: "El Mundo", url: "https://e00-elmundo.uecdn.es/elmundo/rss/espana.xml", category: "media" },
  { id: "abc", name: "ABC", url: "https://www.abc.es/rss/2.0/espana/", category: "media" },
  { id: "lavanguardia", name: "La Vanguardia", url: "https://www.lavanguardia.com/rss/politica.xml", category: "media" },
  { id: "20minutos", name: "20 Minutos", url: "https://www.20minutos.es/rss/nacional/", category: "media" },
  { id: "eldiario", name: "elDiario.es", url: "https://www.eldiario.es/rss/politica/", category: "media" },
  { id: "elconfidencial", name: "El Confidencial", url: "https://rss.elconfidencial.com/espana/", category: "media" },
  { id: "publico", name: "Público", url: "https://www.publico.es/rss/politica", category: "media" },
  { id: "rtve", name: "RTVE Noticias", url: "https://www.rtve.es/noticias/rss/nacional/", category: "media" },
  { id: "civio", name: "Civio", url: "https://civio.es/feed/", category: "media" },
  // Institutional
  { id: "boe", name: "BOE", url: "https://www.boe.es/rss/boe.php?s=1", category: "institutional" },
  { id: "congreso", name: "Congreso", url: "https://www.congreso.es/webpub/rss/contenidos-rss.xml", category: "institutional" },
  { id: "moncloa", name: "Moncloa", url: "https://www.lamoncloa.gob.es/Paginas/rss.aspx", category: "institutional" },
  // Agencies
  { id: "europapress", name: "Europa Press", url: "https://www.europapress.es/rss/rss.aspx?ch=00285", category: "agency" },
];

// ── Types ───────────────────────────────────────────────────────────────────

export interface TrendingItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceCategory: "media" | "institutional" | "agency";
  matches: InternalMatch[];
}

export interface InternalMatch {
  type: "politician" | "party" | "territory";
  slug: string;
  name: string;
  href: string;
}

// ── Entity index for keyword matching ───────────────────────────────────────

interface MatchCandidate {
  keywords: string[];
  match: InternalMatch;
}

function buildMatchIndex(): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  for (const p of politicians) {
    const keywords: string[] = [p.fullName.toLowerCase()];
    // Add last name(s) — split fullName and take everything after first word
    const parts = p.fullName.split(" ");
    if (parts.length >= 2) {
      // Add last two words as a keyword (e.g. "Sánchez", "Pedro Sánchez")
      keywords.push(parts.slice(1).join(" ").toLowerCase());
      if (parts.length >= 3) {
        // Also just the last surname
        keywords.push(parts[parts.length - 1].toLowerCase());
      }
    }
    if (p.shortName && p.shortName !== p.fullName) {
      keywords.push(p.shortName.toLowerCase());
    }
    candidates.push({
      keywords,
      match: {
        type: "politician",
        slug: p.slug,
        name: p.shortName || p.fullName,
        href: `/politicians/${p.slug}`,
      },
    });
  }

  for (const party of parties) {
    const keywords = [
      party.acronym.toLowerCase(),
      party.shortName.toLowerCase(),
      party.officialName.toLowerCase(),
    ];
    candidates.push({
      keywords,
      match: {
        type: "party",
        slug: party.slug,
        name: party.acronym,
        href: `/parties/${party.slug}`,
      },
    });
  }

  for (const t of territories) {
    if (t.kind === "state") continue; // skip "España" itself
    const keywords = [t.name.toLowerCase(), t.shortCode.toLowerCase()];
    candidates.push({
      keywords,
      match: {
        type: "territory",
        slug: t.slug,
        name: t.name,
        href: `/territories/${t.slug}`,
      },
    });
  }

  return candidates;
}

const matchIndex = buildMatchIndex();

// Common words to avoid false positives on short keywords
const skipWords = new Set([
  "pp", "cs", // too short / ambiguous in text — but we DO want these for parties
]);

function findMatches(text: string): InternalMatch[] {
  const lower = text.toLowerCase();
  const found: InternalMatch[] = [];
  const seenSlugs = new Set<string>();

  for (const candidate of matchIndex) {
    if (seenSlugs.has(candidate.match.slug)) continue;

    for (const kw of candidate.keywords) {
      // Skip very short keywords (<=2 chars) unless they're party acronyms
      if (kw.length <= 2 && candidate.match.type !== "party") continue;

      // For party acronyms, require word boundaries
      if (candidate.match.type === "party" && kw.length <= 3) {
        const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
        if (regex.test(text)) {
          found.push(candidate.match);
          seenSlugs.add(candidate.match.slug);
          break;
        }
      } else if (lower.includes(kw)) {
        found.push(candidate.match);
        seenSlugs.add(candidate.match.slug);
        break;
      }
    }
  }

  return found;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── RSS parser (simple XML extraction) ──────────────────────────────────────

function parseRssItems(xml: string): { title: string; link: string; pubDate: string }[] {
  const items: { title: string; link: string; pubDate: string }[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link") || extractTag(block, "guid");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date") || "";
    if (title && link) {
      items.push({ title: cleanCdata(title), link: cleanCdata(link).trim(), pubDate });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(regex);
  return m ? m[1] : "";
}

function cleanCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

// ── Fetcher with timeout + cache ────────────────────────────────────────────

let cachedResult: { items: TrendingItem[]; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchFeed(feed: FeedSource): Promise<TrendingItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "User-Agent": "IAN-Bot/1.0 (political-intelligence)" },
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const rawItems = parseRssItems(xml);

    return rawItems.slice(0, 8).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: feed.name,
      sourceCategory: feed.category,
      matches: findMatches(item.title),
    }));
  } catch {
    return [];
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getTrending(limit = 20): Promise<TrendingItem[]> {
  // Check cache
  if (cachedResult && Date.now() - cachedResult.fetchedAt < CACHE_TTL) {
    return cachedResult.items.slice(0, limit);
  }

  // Fetch all feeds in parallel
  const results = await Promise.all(feeds.map(fetchFeed));
  const allItems = results.flat();

  // Sort by pubDate (newest first), then prioritize items with matches
  allItems.sort((a, b) => {
    // Items with matches rank higher
    const aHasMatch = a.matches.length > 0 ? 1 : 0;
    const bHasMatch = b.matches.length > 0 ? 1 : 0;
    if (aHasMatch !== bHasMatch) return bHasMatch - aHasMatch;

    // Then by date
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  // Deduplicate by similar titles (first 40 chars)
  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    const key = item.title.substring(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Persist to JSONL archive for RAG analysis
  try {
    persistTrending(deduped);
  } catch {
    // Non-blocking — don't fail the page if write fails
  }

  cachedResult = { items: deduped, fetchedAt: Date.now() };
  return deduped.slice(0, limit);
}

/** Get just the feed source list (for the sources page) */
export function getRssSources(): FeedSource[] {
  return feeds;
}
