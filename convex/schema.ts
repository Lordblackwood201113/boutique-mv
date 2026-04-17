import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    isActive: v.boolean(),
    stock: v.optional(v.number()),
    order: v.optional(v.number()),
  })
    .index("by_category", ["categoryId"])
    .index("by_active", ["isActive"])
    .index("by_order", ["order"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    order: v.optional(v.number()),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    orderNumber: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.string(),
    }),
    total: v.number(),
    source: v.union(v.literal("whatsapp"), v.literal("form")),
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    statusHistory: v.array(
      v.object({
        status: v.string(),
        timestamp: v.number(),
      })
    ),
  })
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_orderNumber", ["orderNumber"]),

  content: defineTable({
    section: v.string(),
    data: v.any(),
  }).index("by_section", ["section"]),

  admins: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
