/* ═══════════════════════════════════════════════════════════════════════════
   RSS Store — persists fetched RSS items to a JSONL file for RAG analysis.
   Each line is a JSON object with title, link, source, date, and matches.
   The research page and API can query this archive.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { TrendingItem } from "./rss-trending";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "rss-archive.jsonl");

interface StoredItem {
  title: string;
  link: string;
  source: string;
  sourceCategory: string;
  pubDate: string;
  fetchedAt: string;
  matches: { type: string; slug: string; name: string; href: string }[];
}

/** Ensure data directory exists */
function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** Append new trending items to the JSONL archive (deduplicates by link) */
export function persistTrending(items: TrendingItem[]): number {
  ensureDir();

  // Load existing links for dedup
  const existingLinks = new Set<string>();
  if (existsSync(STORE_PATH)) {
    const lines = readFileSync(STORE_PATH, "utf-8").split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as StoredItem;
        existingLinks.add(obj.link);
      } catch {
        // skip malformed lines
      }
    }
  }

  const now = new Date().toISOString();
  let added = 0;

  for (const item of items) {
    if (existingLinks.has(item.link)) continue;

    const stored: StoredItem = {
      title: item.title,
      link: item.link,
      source: item.source,
      sourceCategory: item.sourceCategory,
      pubDate: item.pubDate,
      fetchedAt: now,
      matches: item.matches.map((m) => ({
        type: m.type,
        slug: m.slug,
        name: m.name,
        href: m.href,
      })),
    };

    appendFileSync(STORE_PATH, JSON.stringify(stored) + "\n");
    existingLinks.add(item.link);
    added++;
  }

  return added;
}

/** Read all stored items (for RAG / research queries) */
export function readArchive(options?: {
  limit?: number;
  entitySlug?: string;
  entityType?: string;
  sourceFilter?: string;
  since?: Date;
}): StoredItem[] {
  ensureDir();
  if (!existsSync(STORE_PATH)) return [];

  const lines = readFileSync(STORE_PATH, "utf-8").split("\n").filter(Boolean);
  let items: StoredItem[] = [];

  for (const line of lines) {
    try {
      items.push(JSON.parse(line));
    } catch {
      // skip
    }
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.pubDate || b.fetchedAt).getTime() - new Date(a.pubDate || a.fetchedAt).getTime());

  // Apply filters
  if (options?.since) {
    const sinceTs = options.since.getTime();
    items = items.filter((i) => new Date(i.pubDate || i.fetchedAt).getTime() >= sinceTs);
  }

  if (options?.sourceFilter) {
    const sf = options.sourceFilter.toLowerCase();
    items = items.filter((i) => i.source.toLowerCase().includes(sf));
  }

  if (options?.entitySlug) {
    items = items.filter((i) =>
      i.matches.some((m) => m.slug === options.entitySlug && (!options.entityType || m.type === options.entityType))
    );
  }

  if (options?.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

/** Get media coverage stats for an entity */
export function getEntityCoverage(slug: string): {
  totalMentions: number;
  sources: Record<string, number>;
  recentHeadlines: { title: string; source: string; date: string }[];
} {
  const items = readArchive({ entitySlug: slug });
  const sources: Record<string, number> = {};

  for (const item of items) {
    sources[item.source] = (sources[item.source] || 0) + 1;
  }

  return {
    totalMentions: items.length,
    sources,
    recentHeadlines: items.slice(0, 10).map((i) => ({
      title: i.title,
      source: i.source,
      date: i.pubDate || i.fetchedAt,
    })),
  };
}
