import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

function getPeriodStart(period: string): number {
  const now = Date.now();
  switch (period) {
    case "today": {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case "7d":
      return now - 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return now - 30 * 24 * 60 * 60 * 1000;
    default:
      return 0; // all time
  }
}

/** Dashboard KPIs */
export const dashboard = query({
  args: {
    period: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const periodStart = getPeriodStart(args.period ?? "all");
    const allOrders = await ctx.db.query("orders").collect();
    const orders = periodStart
      ? allOrders.filter((o) => o._creationTime >= periodStart)
      : allOrders;

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const ordersToday = allOrders.filter(
      (o) => o._creationTime >= todayStart.getTime()
    ).length;

    const activeProducts = await ctx.db
      .query("products")
      .withIndex("by_active", (q: any) => q.eq("isActive", true))
      .collect();

    return {
      totalOrders,
      totalRevenue,
      ordersToday,
      activeProducts: activeProducts.length,
    };
  },
});

/** Top 10 products by sales volume */
export const topProducts = query({
  args: {
    period: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const periodStart = getPeriodStart(args.period ?? "all");
    const allOrders = await ctx.db.query("orders").collect();
    const orders = periodStart
      ? allOrders.filter(
          (o) => o._creationTime >= periodStart && o.status !== "cancelled"
        )
      : allOrders.filter((o) => o.status !== "cancelled");

    // Aggregate sales by product
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      }
    }

    return Object.entries(productSales)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  },
});

/** Sales aggregated by day (for chart) */
export const salesByPeriod = query({
  args: {
    period: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const periodStart = getPeriodStart(args.period ?? "30d");
    const allOrders = await ctx.db.query("orders").collect();
    const orders = allOrders.filter(
      (o) => o._creationTime >= periodStart && o.status !== "cancelled"
    );

    // Aggregate by day
    const dailySales: Record<string, { date: string; revenue: number; count: number }> = {};
    for (const order of orders) {
      const date = new Date(order._creationTime).toISOString().split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { date, revenue: 0, count: 0 };
      }
      dailySales[date].revenue += order.total;
      dailySales[date].count += 1;
    }

    return Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date));
  },
});
