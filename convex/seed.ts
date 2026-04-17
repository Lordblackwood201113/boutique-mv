import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAdmin = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique();

    if (existing) {
      return { status: "already_exists", adminId: existing._id };
    }

    const adminId = await ctx.db.insert("admins", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      email: args.email,
    });

    return { status: "created", adminId };
  },
});

const CATEGORIES = [
  { name: "Gourdes", slug: "gourdes", order: 1 },
  { name: "Vêtements", slug: "vetements", order: 2 },
];

const PRODUCTS = [
  {
    name: "Tasse à paille",
    description: "Tasse à paille en verre",
    price: 3500,
    categorySlug: "gourdes",
    images: [
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764101234/2_j4pskv.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764101234/1_ueuzkw.jpg",
    ],
    isActive: true,
    order: 1,
  },
  {
    name: "Gourde Tau Pei Bear",
    description: "Gourde 3 en 1",
    price: 6000,
    categorySlug: "gourdes",
    images: [
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085877/2_u0co5l.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085877/1_qkhvkl.jpg",
    ],
    isActive: true,
    order: 2,
  },
  {
    name: "Cardigan 2500",
    description: "Cardigan 3ème choix",
    price: 2500,
    categorySlug: "vetements",
    images: [
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085560/1_smdd3s.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764085560/2_zh3hcd.jpg",
    ],
    isActive: true,
    order: 3,
  },
  {
    name: "Cardigan 3500",
    description: "Cardigan 2ème choix",
    price: 3500,
    categorySlug: "vetements",
    images: [
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/4_jj0vlq.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/1_s5dbam.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/3_qsrgqx.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764069266/2_xvvqt6.jpg",
    ],
    isActive: true,
    order: 4,
  },
  {
    name: "Stanley CUP",
    description:
      "La gourde Stanley Quencher H2.0 FlowState est votre alliée hydratation quotidienne. Fabriquée en acier inoxydable recyclé, elle garde vos boissons fraîches pendant des heures. Design ergonomique compatible avec les porte-gobelets de voiture.",
    price: 15000,
    categorySlug: "gourdes",
    images: [
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764087013/3_e30qzy.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764087012/1_xv0je5.jpg",
      "https://res.cloudinary.com/dkmjigwg2/image/upload/v1764087012/2_jucr8y.jpg",
    ],
    isActive: true,
    order: 5,
  },
];

export const seedProducts = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { status: "already_seeded", categories: existingCategories.length };
    }

    // Seed categories
    const categoryMap: Record<string, Id<"categories">> = {};
    for (const cat of CATEGORIES) {
      const id = await ctx.db.insert("categories", cat);
      categoryMap[cat.slug] = id;
    }

    // Seed products
    let productCount = 0;
    for (const product of PRODUCTS) {
      const { categorySlug, ...productData } = product;
      await ctx.db.insert("products", {
        ...productData,
        categoryId: categoryMap[categorySlug],
      });
      productCount++;
    }

    return {
      status: "seeded",
      categories: CATEGORIES.length,
      products: productCount,
    };
  },
});

const CONTENT_SECTIONS = [
  {
    section: "hero",
    data: {
      label: "Collection 2024",
      title: "Esthétique du Quotidien.",
      description:
        "Une sélection curatée d'objets pour la maison et le style de vie. La rencontre entre utilité et beauté pure.",
      cta: "Explorer le catalogue",
      quote: "Le détail qui change tout.",
      imageUrl:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2670&auto=format&fit=crop",
    },
  },
  {
    section: "philosophy",
    data: {
      title: "Moins, mais mieux.",
      description:
        "Chez BMV Boutique, nous croyons que les objets qui nous entourent définissent notre état d'esprit. Notre philosophie est simple : sélectionner des pièces qui apportent du calme, du confort et une esthétique intemporelle à votre vie.",
      pillars: [
        {
          heading: "Qualité",
          text: "Matériaux durables et finitions soignées.",
        },
        {
          heading: "Design",
          text: "Lignes épurées et style contemporain.",
        },
        {
          heading: "Service",
          text: "Une expérience d'achat humaine et directe.",
        },
      ],
    },
  },
  {
    section: "contact",
    data: {
      phone: "+225 07 67 72 93 96",
      whatsapp: "2250767729396",
      email: "hello@bmvboutique.ci",
      address: "Abidjan, Côte d'Ivoire",
    },
  },
  {
    section: "social",
    data: {
      instagram: "",
      facebook: "",
      whatsapp: "2250767729396",
    },
  },
  {
    section: "store",
    data: {
      name: "Boutique MV",
      tagline: "Redéfinir l'essentiel.",
      copyright: "© 2025 BMV BOUTIQUE.",
      deliveryInfo:
        "Frais entre 1500 et 3000 FCFA à prévoir selon votre zone.",
      currency: "FCFA",
    },
  },
];

export const seedContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("content").collect();
    if (existing.length > 0) {
      return { status: "already_seeded", sections: existing.length };
    }

    for (const content of CONTENT_SECTIONS) {
      await ctx.db.insert("content", {
        section: content.section,
        data: content.data,
      });
    }

    return { status: "seeded", sections: CONTENT_SECTIONS.length };
  },
});
