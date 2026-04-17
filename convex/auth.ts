import { query, mutation } from "./_generated/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Non authentifié. Veuillez vous connecter.");
  }

  const admin = await ctx.db
    .query("admins")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!admin) {
    throw new Error("Accès refusé. Vous n'êtes pas administrateur.");
  }

  return { identity, admin };
}

/**
 * Vérifie si l'utilisateur connecté est admin.
 * Si la table admins est vide, le premier utilisateur connecté
 * est automatiquement enregistré comme admin.
 */
export const ensureAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAdmin: false, reason: "not_authenticated" };
    }

    // Déjà admin ?
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existing) {
      return { isAdmin: true, admin: existing };
    }

    // S'il n'y a aucun admin, auto-enregistrer le premier utilisateur
    const allAdmins = await ctx.db.query("admins").collect();
    if (allAdmins.length === 0) {
      const adminId = await ctx.db.insert("admins", {
        tokenIdentifier: identity.tokenIdentifier,
        name: identity.name ?? identity.email ?? "Admin",
        email: identity.email ?? "",
      });
      const admin = await ctx.db.get(adminId);
      return { isAdmin: true, admin, firstAdmin: true };
    }

    return { isAdmin: false, reason: "not_admin" };
  },
});

/** Vérifie le statut admin (query, sans mutation) */
export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { isAdmin: false };

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    const hasAnyAdmin = (await ctx.db.query("admins").first()) !== null;

    return {
      isAdmin: !!admin,
      hasAnyAdmin,
    };
  },
});
