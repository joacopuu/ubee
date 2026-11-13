"use server";

import { updateTag } from "next/cache";

/**
 * Called by the panel right after it saves content in Supabase.
 * Expires the cached pages so the next visitor sees the change.
 * It only clears a cache (no data is written here), so it is safe to expose.
 */
export async function publishContent() {
  updateTag("content");
}
