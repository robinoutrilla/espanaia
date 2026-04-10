import { fetchJson, fetchText, slugify } from "./utils.js";

/* ────────────────────────────────────────────────────────────────────────────
 * Open-source social & public profile connectors for Spanish politicians
 * and parties. These use exclusively open protocols and APIs:
 *
 * 1. Wikidata SPARQL — Structured data on politicians, parties, positions
 * 2. Mastodon/Fediverse — Public posts via ActivityPub (no auth needed)
 * 3. Bluesky (AT Protocol) — Public posts via open API
 * 4. RSS feeds — Official party/government press releases
 * 5. Wikipedia API — Biographies and references
 *
 * Note: X/Twitter, Instagram, and Facebook require proprietary API keys
 * and have restricted access. We intentionally use open alternatives.
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Wikidata SPARQL ──────────────────────────────────────────────────────

const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

export interface WikidataPoliticianProfile {
  wikidataId: string;
  name: string;
  partyName?: string;
  partyWikidataId?: string;
  position?: string;
  birthDate?: string;
  constituency?: string;
  twitterHandle?: string;
  mastodonAddress?: string;
  blueskyHandle?: string;
  officialWebsite?: string;
  wikipediaUrl?: string;
  imageUrl?: string;
}

/**
 * Fetch Spanish Congress/Senate members from Wikidata with their social handles.
 * This returns structured data including any known Mastodon/Bluesky/X handles.
 */
export async function fetchSpanishPoliticiansFromWikidata(): Promise<WikidataPoliticianProfile[]> {
  const sparql = `
    SELECT DISTINCT ?person ?personLabel ?partyLabel ?party ?positionLabel
           ?birthDate ?twitterHandle ?mastodonAddress ?blueskyHandle
           ?website ?article ?image ?constituencyLabel
    WHERE {
      ?person wdt:P39 ?position .
      VALUES ?position {
        wd:Q18171345   # member of Congress of Deputies
        wd:Q19323171   # member of Senate of Spain
      }
      OPTIONAL { ?person wdt:P102 ?party }
      OPTIONAL { ?person wdt:P569 ?birthDate }
      OPTIONAL { ?person wdt:P2002 ?twitterHandle }
      OPTIONAL { ?person wdt:P4033 ?mastodonAddress }
      OPTIONAL { ?person wdt:P12361 ?blueskyHandle }
      OPTIONAL { ?person wdt:P856 ?website }
      OPTIONAL { ?person wdt:P18 ?image }
      OPTIONAL { ?person wdt:P768 ?constituency }
      OPTIONAL {
        ?article schema:about ?person ;
                 schema:isPartOf <https://es.wikipedia.org/> .
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en" }
    }
    ORDER BY ?personLabel
  `;

  try {
    const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`;
    const result = await fetchJson<{
      results: {
        bindings: Array<Record<string, { value: string; type: string }>>;
      };
    }>(url, {
      headers: { Accept: "application/sparql-results+json" },
    });

    return result.results.bindings.map((binding) => ({
      wikidataId: binding.person?.value?.split("/").pop() ?? "",
      name: binding.personLabel?.value ?? "",
      partyName: binding.partyLabel?.value,
      partyWikidataId: binding.party?.value?.split("/").pop(),
      position: binding.positionLabel?.value,
      birthDate: binding.birthDate?.value?.slice(0, 10),
      constituency: binding.constituencyLabel?.value,
      twitterHandle: binding.twitterHandle?.value,
      mastodonAddress: binding.mastodonAddress?.value,
      blueskyHandle: binding.blueskyHandle?.value,
      officialWebsite: binding.website?.value,
      wikipediaUrl: binding.article?.value,
      imageUrl: binding.image?.value,
    }));
  } catch {
    return [];
  }
}

// ── Mastodon/Fediverse ───────────────────────────────────────────────────

export interface MastodonPost {
  id: string;
  createdAt: string;
  content: string;
  url: string;
  reblogsCount: number;
  favouritesCount: number;
  repliesCount: number;
}

/**
 * Fetch recent public posts from a Mastodon account.
 * Address format: "@user@instance.social"
 */
export async function fetchMastodonTimeline(
  mastodonAddress: string,
  limit = 20,
): Promise<MastodonPost[]> {
  const match = mastodonAddress.match(/@?([^@]+)@(.+)/);
  if (!match) return [];

  const [, username, instance] = match;
  try {
    // First, look up the account ID
    const lookupUrl = `https://${instance}/api/v1/accounts/lookup?acct=${username}`;
    const account = await fetchJson<{ id: string }>(lookupUrl);

    // Then fetch their statuses
    const statusesUrl = `https://${instance}/api/v1/accounts/${account.id}/statuses?limit=${limit}&exclude_replies=true`;
    const statuses = await fetchJson<Array<{
      id: string;
      created_at: string;
      content: string;
      url: string;
      reblogs_count: number;
      favourites_count: number;
      replies_count: number;
    }>>(statusesUrl);

    return statuses.map((status) => ({
      id: status.id,
      createdAt: status.created_at,
      content: status.content,
      url: status.url,
      reblogsCount: status.reblogs_count,
      favouritesCount: status.favourites_count,
      repliesCount: status.replies_count,
    }));
  } catch {
    return [];
  }
}

// ── Bluesky (AT Protocol) ────────────────────────────────────────────────

export interface BlueskyPost {
  uri: string;
  cid: string;
  createdAt: string;
  text: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
}

/**
 * Fetch recent public posts from a Bluesky account.
 * No authentication needed for public profiles.
 */
export async function fetchBlueskyTimeline(
  handle: string,
  limit = 20,
): Promise<BlueskyPost[]> {
  try {
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=${limit}&filter=posts_no_replies`;
    const result = await fetchJson<{
      feed: Array<{
        post: {
          uri: string;
          cid: string;
          record: { createdAt: string; text: string };
          likeCount: number;
          repostCount: number;
          replyCount: number;
        };
      }>;
    }>(url);

    return result.feed.map(({ post }) => ({
      uri: post.uri,
      cid: post.cid,
      createdAt: post.record.createdAt,
      text: post.record.text,
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
    }));
  } catch {
    return [];
  }
}

// ── Wikipedia (MediaWiki API) ────────────────────────────────────────────

export interface WikipediaSummary {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
}

/**
 * Fetch Wikipedia summary for a Spanish politician by name.
 */
export async function fetchWikipediaSummary(
  name: string,
  lang = "es",
): Promise<WikipediaSummary | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    const result = await fetchJson<{
      title: string;
      extract: string;
      content_urls: { desktop: { page: string } };
      thumbnail?: { source: string };
    }>(url);

    return {
      title: result.title,
      extract: result.extract,
      pageUrl: result.content_urls.desktop.page,
      thumbnailUrl: result.thumbnail?.source,
    };
  } catch {
    return null;
  }
}

// ── RSS Feed Parser (lightweight) ────────────────────────────────────────

export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
}

/**
 * Parse a simple RSS/Atom feed and return items.
 * Useful for official party press releases and government news.
 */
export async function fetchRssFeed(feedUrl: string, limit = 20): Promise<RssItem[]> {
  try {
    const xml = await fetchText(feedUrl);
    const items: RssItem[] = [];

    // Simple RSS 2.0 parsing
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
    for (const block of itemBlocks.slice(0, limit)) {
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
      const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim();

      if (title && link) {
        items.push({ title, link, pubDate, description });
      }
    }

    return items;
  } catch {
    return [];
  }
}

/** Known RSS feeds for major Spanish political parties */
export function getPartyRssFeeds(): Array<{ partySlug: string; feedUrl: string; label: string }> {
  return [
    { partySlug: "psoe", feedUrl: "https://www.psoe.es/feed/", label: "PSOE — Noticias oficiales" },
    { partySlug: "pp", feedUrl: "https://www.pp.es/feed", label: "PP — Noticias oficiales" },
    { partySlug: "sumar", feedUrl: "https://movimientosumar.es/feed/", label: "Sumar — Comunicación" },
  ];
}
