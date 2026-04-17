import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ─── Helpers ───────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Public Queries ────────────────────────────────────────────────

/** Liste de toutes les catégories */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

/** Liste des catégories avec nombre de produits (admin) */
export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const categories = await ctx.db.query("categories").collect();
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const products = await ctx.db
          .query("products")
          .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
          .collect();
        return { ...cat, productCount: products.length };
      })
    );
    return enriched;
  },
});

// ─── Admin Mutations ───────────────────────────────────────────────

/** Créer une catégorie */
export const create = mutation({
  args: {
    name: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const slug = slugify(args.name);
    if (!slug) {
      throw new Error("Le nom de la catégorie doit contenir au moins une lettre ou un chiffre.");
    }

    // Vérifier unicité du slug
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      throw new Error(`Une catégorie avec le slug "${slug}" existe déjà.`);
    }

    const doc: { name: string; slug: string; order?: number } = {
      name: args.name,
      slug,
    };
    if (args.order !== undefined) {
      doc.order = args.order;
    }

    return await ctx.db.insert("categories", doc);
  },
});

/** Modifier une catégorie */
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Catégorie introuvable.");
    }

    const updates: Record<string, unknown> = {};

    if (args.name !== undefined) {
      updates.name = args.name;
      updates.slug = slugify(args.name);

      // Vérifier unicité du nouveau slug
      const duplicate = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug as string))
        .unique();

      if (duplicate && duplicate._id !== args.id) {
        throw new Error(`Une catégorie avec le slug "${updates.slug}" existe déjà.`);
      }
    }

    if (args.order !== undefined) {
      updates.order = args.order;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/** Supprimer une catégorie (bloqué si des produits y sont liés) */
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Catégorie introuvable.");
    }

    // Vérifier s'il y a des produits liés
    const linkedProduct = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();

    if (linkedProduct) {
      throw new Error(
        "Impossible de supprimer cette catégorie : des produits y sont encore rattachés. Déplacez-les d'abord."
      );
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
