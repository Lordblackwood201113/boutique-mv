import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./auth";

/** Resolve Convex storage IDs to public URLs in content data */
async function resolveStorageUrls(ctx: QueryCtx, data: any): Promise<any> {
  if (!data || typeof data !== "object") return data;
  const resolved = { ...data };
  if (
    typeof resolved.image === "string" &&
    resolved.image &&
    !resolved.image.startsWith("http")
  ) {
    const url = await ctx.storage.getUrl(resolved.image as Id<"_storage">);
    if (url) resolved.image = url;
  }
  return resolved;
}

/** Get content for a specific section (public) */
export const get = query({
  args: { section: v.string() },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("content")
      .withIndex("by_section", (q: any) => q.eq("section", args.section))
      .first();
    if (!content?.data) return null;
    return await resolveStorageUrls(ctx, content.data);
  },
});

/** Get all content sections as a map (public) */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("content").collect();
    const map: Record<string, any> = {};
    for (const item of all) {
      map[item.section] = item.data
        ? await resolveStorageUrls(ctx, item.data)
        : item.data;
    }
    return map;
  },
});

/** List all content sections (admin) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("content").collect();
  },
});

/** Upsert content for a section (admin) */
export const upsert = mutation({
  args: {
    section: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("content")
      .withIndex("by_section", (q: any) => q.eq("section", args.section))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { data: args.data });
      return existing._id;
    }

    return await ctx.db.insert("content", {
      section: args.section,
      data: args.data,
    });
  },
});
