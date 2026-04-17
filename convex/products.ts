import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";
import { Id } from "./_generated/dataModel";

// ─── Public Queries ────────────────────────────────────────────────

/** Liste des produits actifs (storefront) */
export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

/** Liste enrichie pour le storefront (catégorie + URLs images résolues) */
export const listStorefront = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return await Promise.all(
      products.map(async (product) => {
        const category = await ctx.db.get(product.categoryId);
        const resolvedImages = await Promise.all(
          product.images.map(async (img) => {
            // Cloudinary/external URLs pass through; storage IDs get resolved
            if (img.startsWith("http")) return img;
            const url = await ctx.storage.getUrl(img as Id<"_storage">);
            return url ?? "";
          })
        );
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          currency: "FCFA" as const,
          description: product.description,
          images: resolvedImages.filter(Boolean),
          category: category?.name ?? "Autres",
        };
      })
    );
  },
});

/** Détail d'un produit par ID (storefront) */
export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/** Détail enrichi d'un produit (storefront) */
export const getStorefront = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || !product.isActive) return null;

    const category = await ctx.db.get(product.categoryId);
    const resolvedImages = await Promise.all(
      product.images.map(async (img) => {
        if (img.startsWith("http")) return img;
        const url = await ctx.storage.getUrl(img as Id<"_storage">);
        return url ?? "";
      })
    );

    return {
      id: product._id,
      name: product.name,
      price: product.price,
      currency: "FCFA" as const,
      description: product.description,
      images: resolvedImages.filter(Boolean),
      category: category?.name ?? "Autres",
    };
  },
});

// ─── Admin Queries ─────────────────────────────────────────────────

/** Liste de tous les produits (admin) */
export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").collect();
    // Enrichir avec le nom de la catégorie
    const enriched = await Promise.all(
      products.map(async (product) => {
        const category = await ctx.db.get(product.categoryId);
        return {
          ...product,
          categoryName: category?.name ?? "Sans catégorie",
        };
      })
    );
    return enriched;
  },
});

// ─── Admin Mutations ───────────────────────────────────────────────

/** Créer un produit */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    isActive: v.boolean(),
    stock: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("products", args);
  },
});

/** Modifier un produit */
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    images: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    stock: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Produit introuvable.");
    }

    // Only patch provided fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/** Supprimer un produit */
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Produit introuvable.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/** Générer une URL d'upload pour Convex Storage */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Obtenir l'URL publique d'un fichier stocké */
export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as Id<"_storage">);
  },
});

/** Supprimer un fichier du storage */
export const deleteImage = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.storage.delete(args.storageId as Id<"_storage">);
  },
});

/** Activer/désactiver un produit */
export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Produit introuvable.");
    }

    await ctx.db.patch(args.id, { isActive: !existing.isActive });
    return { id: args.id, isActive: !existing.isActive };
  },
});
