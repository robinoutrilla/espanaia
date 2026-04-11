import { NextResponse } from "next/server";
import {
  periodicoData,
  getArticleById,
  getArticlesByCategory,
  getPortadaArticles,
  searchArticles,
  type ArticleCategory,
} from "../../../lib/periodico-data";
import { getTrending, type TrendingItem } from "../../../lib/rss-trending";

/** Revalidate every 5 minutes — Vercel ISR */
export const revalidate = 300;

/**
 * GET /api/periodico
 *
 * Query parameters:
 *   (none)          → full periodicoData payload + live RSS feed
 *   ?id=<articleId> → single article
 *   ?category=<cat> → articles filtered by category
 *   ?portada=true   → front-page articles only
 *   ?q=<search>     → full-text search across headlines, summaries & tags
 *   ?live=true      → only live RSS feed (for polling)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Live RSS only (lightweight endpoint for polling)
  if (searchParams.get("live") === "true") {
    try {
      const trending = await getTrending(30);
      return NextResponse.json({
        liveFeed: trending,
        fetchedAt: new Date().toISOString(),
      });
    } catch {
      return NextResponse.json({ liveFeed: [], fetchedAt: new Date().toISOString() });
    }
  }

  // Single article by id
  const id = searchParams.get("id");
  if (id) {
    const article = getArticleById(id);
    if (!article) {
      return NextResponse.json(
        { error: "Artículo no encontrado", id },
        { status: 404 },
      );
    }
    return NextResponse.json({ article });
  }

  // Filter by category
  const category = searchParams.get("category");
  if (category) {
    const validCategories: ArticleCategory[] = [
      "politica",
      "economia",
      "sociedad",
      "europa",
      "tecnologia",
      "territorio",
    ];
    if (!validCategories.includes(category as ArticleCategory)) {
      return NextResponse.json(
        {
          error: "Categoría no válida",
          valid: validCategories,
        },
        { status: 400 },
      );
    }
    return NextResponse.json({
      category,
      articles: getArticlesByCategory(category as ArticleCategory),
    });
  }

  // Front-page articles
  if (searchParams.get("portada") === "true") {
    return NextResponse.json({ articles: getPortadaArticles() });
  }

  // Search
  const q = searchParams.get("q");
  if (q) {
    return NextResponse.json({ query: q, results: searchArticles(q) });
  }

  // Default: return full dataset + live RSS feed
  let liveFeed: TrendingItem[] = [];
  try {
    liveFeed = await getTrending(30);
  } catch {
    // Non-blocking: return editorial data even if RSS fails
  }

  return NextResponse.json({
    ...periodicoData,
    liveFeed,
    fetchedAt: new Date().toISOString(),
  });
}
