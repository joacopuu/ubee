import "server-only";
import { unstable_cache } from "next/cache";
import { staticContent, type Content } from "./data";
import { rowToNews, rowToProduct, rowToService } from "./mappers";
import { db } from "./supabase";

/**
 * Site content (services, products, news).
 *
 * Cached for an hour with the "content" tag: pages are served from the
 * cache, and when the salon saves something in the panel a Server Action
 * calls updateTag("content"), so the next visit already shows the change.
 * (unstable_cache instead of "use cache": Cache Components hang on Workers.)
 */
export const getContent = unstable_cache(loadContent, ["content"], {
  tags: ["content"],
  revalidate: 3600,
});

async function loadContent(): Promise<Content> {
  const client = db();
  if (!client) return staticContent();

  try {
    const [services, products, news] = await Promise.all([
      client.from("services").select("*").eq("active", true).order("sort"),
      client.from("products").select("*").eq("active", true).order("sort"),
      client.from("news").select("*").eq("published", true).order("date", { ascending: false }),
    ]);
    if (services.error || products.error || news.error) throw services.error ?? products.error ?? news.error;
    return {
      services: services.data.map(rowToService),
      products: products.data.map(rowToProduct),
      news: news.data.map(rowToNews),
    };
  } catch (error) {
    // If the database is unreachable the site still renders with the defaults.
    console.error("[content] Supabase no respondió, uso el contenido base.", error);
    return staticContent();
  }
}

