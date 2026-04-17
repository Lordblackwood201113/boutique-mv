import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ─── Helpers ───────────────────────────────────────────────────────

async function generateOrderNumber(ctx: { db: any }): Promise<string> {
  const year = new Date().getFullYear();
  // Count orders created this year (approximate via all orders)
  const allOrders = await ctx.db.query("orders").collect();
  const yearOrders = allOrders.filter((o: any) =>
    o.orderNumber.includes(`BMV-${year}`)
  );
  const nextNum = yearOrders.length + 1;
  return `BMV-${year}-${String(nextNum).padStart(4, "0")}`;
}

// ─── Public Mutations ─────────────────────────────────────────────

/** Créer une commande (public — pour les clients) */
export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
    source: v.union(v.literal("whatsapp"), v.literal("form")),
  },
  handler: async (ctx, args) => {
    // Validate items not empty
    if (args.items.length === 0) {
      throw new Error("La commande doit contenir au moins un produit.");
    }

    // Build order items with product details + validate stock
    const orderItems: {
      productId: any;
      name: string;
      price: number;
      quantity: number;
    }[] = [];
    let total = 0;

    for (const item of args.items) {
      if (item.quantity < 1) {
        throw new Error("La quantité doit être supérieure à 0.");
      }

      const product = await ctx.db.get(item.productId);
      if (!product) {
        throw new Error(`Produit introuvable: ${item.productId}`);
      }
      if (!product.isActive) {
        throw new Error(`Le produit "${product.name}" n'est plus disponible.`);
      }

      // Check stock if managed
      if (product.stock !== undefined && product.stock < item.quantity) {
        throw new Error(
          `Stock insuffisant pour "${product.name}" (disponible: ${product.stock}).`
        );
      }

      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      total += product.price * item.quantity;

      // Decrement stock if managed
      if (product.stock !== undefined) {
        await ctx.db.patch(item.productId, {
          stock: product.stock - item.quantity,
        });
      }
    }

    // Validate customer fields
    if (!args.customer.name.trim()) {
      throw new Error("Le nom du client est obligatoire.");
    }
    if (!args.customer.phone.trim()) {
      throw new Error("Le numéro de téléphone est obligatoire.");
    }

    const orderNumber = await generateOrderNumber(ctx);
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      items: orderItems,
      customer: {
        name: args.customer.name.trim(),
        phone: args.customer.phone.trim(),
        address: args.customer.address.trim(),
      },
      total,
      source: args.source,
      status: "new",
      statusHistory: [{ status: "new", timestamp: now }],
    });

    return { orderId, orderNumber };
  },
});

// ─── Admin Queries ────────────────────────────────────────────────

/** Liste des commandes (admin, filtrable par statut) */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("processing"),
        v.literal("delivered"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("orders").order("desc").collect();
  },
});

/** Détail d'une commande par ID (admin) */
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/** Compteur de nouvelles commandes (admin) */
export const getNewCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const newOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q: any) => q.eq("status", "new"))
      .collect();
    return newOrders.length;
  },
});

// ─── Admin Mutations ──────────────────────────────────────────────

/** Mettre à jour le statut d'une commande (admin) */
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Commande introuvable.");
    }

    // Prevent updating a delivered/cancelled order back
    if (
      (order.status === "delivered" || order.status === "cancelled") &&
      args.status !== order.status
    ) {
      throw new Error(
        `Impossible de modifier le statut d'une commande ${order.status === "delivered" ? "livrée" : "annulée"}.`
      );
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.status,
      statusHistory: [
        ...order.statusHistory,
        { status: args.status, timestamp: now },
      ],
    });

    return { id: args.id, status: args.status };
  },
});
