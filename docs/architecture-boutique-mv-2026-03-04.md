# System Architecture: boutique-mv

**Date:** 2026-03-04
**Architect:** ADMIN
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 3
**Status:** Draft

---

## Document Overview

Ce document définit l'architecture système de boutique-mv. Il fournit le plan technique pour l'implémentation, couvrant toutes les exigences fonctionnelles et non-fonctionnelles du PRD.

**Documents associés :**
- Product Requirements Document: `docs/prd-boutique-mv-2026-03-04.md`
- Product Brief: `docs/product-brief-boutique-mv-2026-03-04.md`

---

## Executive Summary

L'architecture repose sur un pattern **SPA + BaaS** : le frontend React existant est étendu avec une interface d'administration, tandis que Convex assure 100% du backend (base de données, logique serveur, temps réel). Clerk gère l'authentification. Aucun serveur custom n'est nécessaire — le site est déployé comme un bundle statique sur Hostinger, avec Convex et Clerk comme services cloud externes.

Cette architecture est optimale pour un développeur unique avec un budget free tier, tout en offrant des capacités temps réel, une sécurité robuste et une scalabilité transparente via Convex.

---

## Architectural Drivers

Ces exigences influencent le plus les décisions architecturales :

1. **NFR-003/NFR-004 : Sécurité (Clerk + Convex auth)** → L'intégration Clerk-Convex native permet de valider les tokens JWT côté serveur (dans les fonctions Convex) sans infrastructure custom
2. **NFR-001/NFR-002 : Performance** → Les subscriptions reactives de Convex éliminent le besoin de polling et offrent des mises à jour en temps réel
3. **NFR-007 : Intuitivité** → L'interface admin doit être simple, en français, avec feedback visuel immédiat
4. **Contrainte budget free tier** → Architecture sans serveur custom, hébergement statique, services cloud gratuits
5. **NFR-005 : Fiabilité site vitrine** → Le site doit fonctionner indépendamment de l'état de l'admin

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HOSTINGER (Static)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React SPA (Vite Build)                  │   │
│  │  ┌──────────────────┐  ┌──────────────────────┐  │   │
│  │  │   Site Vitrine   │  │   Interface Admin    │  │   │
│  │  │   (Public)       │  │   (Protégé Clerk)    │  │   │
│  │  │                  │  │                      │  │   │
│  │  │  - Catalogue     │  │  - Dashboard         │  │   │
│  │  │  - Détail produit│  │  - CRUD Produits     │  │   │
│  │  │  - Panier        │  │  - Commandes         │  │   │
│  │  │  - Commande      │  │  - Contenu           │  │   │
│  │  └──────┬───────────┘  └────┬─────────────────┘  │   │
│  │         │                   │                     │   │
│  └─────────┼───────────────────┼─────────────────────┘   │
│            │                   │                         │
└────────────┼───────────────────┼─────────────────────────┘
             │                   │
    ┌────────▼───────────────────▼────────────┐
    │          CONVEX CLOUD (BaaS)            │
    │                                         │
    │  ┌─────────────┐  ┌─────────────────┐  │
    │  │  Queries     │  │  Mutations      │  │
    │  │  (lectures)  │  │  (écritures)    │  │
    │  └──────┬──────┘  └───────┬─────────┘  │
    │         │                 │             │
    │  ┌──────▼─────────────────▼──────────┐ │
    │  │        Base de données             │ │
    │  │  (products, orders, content, etc.) │ │
    │  └───────────────────────────────────┘ │
    │                                         │
    │  ┌─────────────────────────────────┐   │
    │  │     File Storage (images)       │   │
    │  └─────────────────────────────────┘   │
    └────────────────┬────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │    CLERK (Auth)     │
          │  - Login/Logout     │
          │  - JWT Tokens       │
          │  - Rôle Admin       │
          └─────────────────────┘
```

### Architecture Diagram (Flux de données)

```
CLIENT (Navigateur)
  │
  ├─── Site Vitrine (Public) ──────────────────────┐
  │    │                                            │
  │    ├── useQuery("products:list") ──────────► Convex Query (public)
  │    ├── useQuery("content:get") ─────────────► Convex Query (public)
  │    └── useMutation("orders:create") ────────► Convex Mutation (public)
  │                                                 │
  ├─── Interface Admin (Protégé) ──────────────────┤
  │    │                                            │
  │    ├── Clerk <SignIn /> ─────────────────────► Clerk Auth
  │    │   └── JWT Token ──────────────────────► Convex (ctx.auth)
  │    │                                            │
  │    ├── useMutation("products:create") ──────► Convex Mutation (auth required)
  │    ├── useMutation("products:update") ──────► Convex Mutation (auth required)
  │    ├── useMutation("products:remove") ──────► Convex Mutation (auth required)
  │    ├── useQuery("orders:list") ─────────────► Convex Query (auth required)
  │    ├── useMutation("orders:updateStatus") ──► Convex Mutation (auth required)
  │    ├── useQuery("stats:dashboard") ─────────► Convex Query (auth required)
  │    └── useMutation("content:update") ───────► Convex Mutation (auth required)
  │
  └─── WhatsApp (externe) ─── wa.me/2250767729396
```

### Architectural Pattern

**Pattern :** SPA (Single Page Application) + BaaS (Backend-as-a-Service)

**Rationale :**
- **Pas de serveur custom** : Convex gère 100% du backend (DB, fonctions serveur, auth, storage). Aucun Express/Fastify/Node.js à maintenir.
- **Temps réel natif** : Les subscriptions Convex mettent à jour l'UI automatiquement quand les données changent (l'admin modifie un produit → le site vitrine se met à jour instantanément).
- **Déploiement simplifié** : Le build React produit des fichiers statiques déployables sur n'importe quel hébergeur (Hostinger).
- **Coût zéro** : Free tier Convex + Clerk + hébergement statique Hostinger.
- **Adapté au développeur unique** : Moins de code à écrire et maintenir qu'une architecture traditionnelle client/serveur.

---

## Technology Stack

### Frontend

**Choix :** React 19 + TypeScript + Vite + Tailwind CSS

**Rationale :**
- Stack existante déjà en place — pas de migration nécessaire
- React 19 offre les dernières optimisations de rendu
- TypeScript assure la sécurité des types, partagée avec les schémas Convex
- Vite offre un DX rapide (HMR instantané, build optimisé)

**Ajouts nécessaires :**
- `react-router-dom` : Routing SPA pour naviguer entre site vitrine et admin
- `@clerk/clerk-react` : Composants d'authentification React
- `convex` + `convex-react` : Client Convex et hooks React

**Trade-offs :**
- (+) Réutilise 100% du code existant
- (+) Pas de courbe d'apprentissage nouveau framework
- (-) Pas de SSR (SEO limité pour le site vitrine — acceptable pour une boutique locale)

---

### Backend

**Choix :** Convex (Backend-as-a-Service)

**Rationale :**
- Base de données + fonctions serveur + file storage en un seul service
- Intégration native avec Clerk pour l'authentification
- TypeScript end-to-end (schémas → fonctions → client)
- Subscriptions reactives (temps réel sans WebSocket custom)
- Free tier généreux : 1M appels de fonctions/mois, 1 Go de stockage

**Fonctions Convex :**
- **Queries** (lectures) : Fonctions pures qui lisent la DB. Peuvent être publiques (site vitrine) ou authentifiées (admin).
- **Mutations** (écritures) : Fonctions qui modifient la DB. Authentifiées pour l'admin, publiques pour les commandes clients.
- **Actions** (effets de bord) : Pour les opérations externes si nécessaire (ex: upload images).

**Trade-offs :**
- (+) Zéro infrastructure à gérer
- (+) Temps réel natif
- (+) TypeScript end-to-end
- (-) Vendor lock-in (dépendance à Convex)
- (-) Limites du free tier à surveiller

---

### Database

**Choix :** Convex Database (intégrée au BaaS)

**Rationale :**
- Base de données document (NoSQL) optimisée pour les applications web
- Schémas typés avec validation automatique
- Indexes pour les requêtes performantes
- Transactions ACID garanties
- Pas de configuration — fournie par Convex

**Trade-offs :**
- (+) Zéro administration DB
- (+) Schémas TypeScript validés
- (-) Pas de SQL — requêtes via l'API Convex
- (-) Migration vers une autre DB nécessiterait un export/import

---

### Infrastructure

**Choix :** Hostinger (hébergement statique) + Convex Cloud + Clerk Cloud

**Rationale :**
- Hostinger : déjà choisi par le propriétaire, supporte les fichiers statiques (HTML/CSS/JS)
- Convex Cloud : backend managé, le frontend communique directement avec Convex via WebSocket
- Clerk Cloud : authentification managée, pas de serveur auth à maintenir

**Architecture de déploiement :**
```
Hostinger ──── Fichiers statiques (HTML, JS, CSS, assets)
                    │
                    ├──── Convex Cloud (WebSocket) ──── Base de données
                    │
                    └──── Clerk Cloud (HTTPS) ──── Authentification
```

---

### Third-Party Services

| Service | Usage | Plan | Limites Free Tier |
|---------|-------|------|-------------------|
| **Convex** | BaaS (DB, fonctions, storage) | Free | 1M appels/mois, 1 Go storage, 256 Mo DB |
| **Clerk** | Authentification | Free | 10 000 MAU |
| **Cloudinary** | Hébergement images (existant) | Free | 25 Go stockage, 25 Go bande passante/mois |
| **WhatsApp** | Canal de commande | Gratuit | Lien wa.me (pas d'API officielle) |

---

### Development & Deployment

| Outil | Usage |
|-------|-------|
| **Git** | Contrôle de version |
| **Vite** | Build & dev server |
| **TypeScript** | Langage (strict mode) |
| **npx convex dev** | Dev server Convex (sync automatique des fonctions) |
| **npx convex deploy** | Déploiement des fonctions Convex en production |
| **vite build** | Build production du frontend |
| **Hostinger** | Upload du dossier `dist/` |

---

## System Components

### Composant 1 : Site Vitrine (Public)

**But :** Interface client pour parcourir le catalogue, voir les produits et passer commande.

**Responsabilités :**
- Affichage dynamique des produits depuis Convex
- Affichage du contenu éditorial (hero, philosophie, contacts) depuis Convex
- Gestion du panier (état local React)
- Soumission de commandes (formulaire + WhatsApp)
- États de chargement et gestion d'erreurs

**Interfaces :**
- Queries Convex publiques : `products:list`, `products:get`, `content:get`, `categories:list`
- Mutations Convex publiques : `orders:create`

**FRs couvertes :** FR-012, FR-013, FR-029, FR-030, FR-031

---

### Composant 2 : Interface Admin (Protégée)

**But :** Back-office pour le propriétaire, protégé par Clerk.

**Responsabilités :**
- Dashboard avec KPIs et statistiques
- CRUD complet des produits et catégories
- Gestion des commandes (liste, détail, statuts)
- Édition du contenu du site vitrine
- Upload d'images produit

**Interfaces :**
- Clerk : `<SignIn />`, `<UserButton />`, `useAuth()`
- Queries Convex authentifiées : `products:listAdmin`, `orders:list`, `stats:dashboard`
- Mutations Convex authentifiées : `products:create`, `products:update`, `products:remove`, `orders:updateStatus`, `content:update`

**Dépendances :** Clerk (auth), Convex (data)

**FRs couvertes :** FR-001 à FR-011, FR-015 à FR-028

---

### Composant 3 : Convex Backend (Fonctions serveur)

**But :** Logique métier côté serveur, validation des données, contrôle d'accès.

**Responsabilités :**
- Validation des schémas de données
- Vérification de l'authentification et du rôle admin
- Exécution des queries et mutations
- Calculs statistiques (agrégations)
- Gestion du storage (images)

**Modules :**
- `convex/products.ts` : CRUD produits
- `convex/categories.ts` : CRUD catégories
- `convex/orders.ts` : Gestion des commandes
- `convex/content.ts` : Gestion du contenu éditorial
- `convex/stats.ts` : Calculs statistiques
- `convex/auth.ts` : Helpers d'authentification
- `convex/schema.ts` : Définition des schémas de données

**FRs couvertes :** Toutes (FR-001 à FR-032)

---

### Composant 4 : Routing (React Router)

**But :** Navigation entre le site vitrine et l'interface admin.

**Structure des routes :**
```
/                    → Page d'accueil (Hero + Philosophie)
/catalogue           → Catalogue produits
/produit/:id         → Détail d'un produit
/admin               → Dashboard admin (protégé)
/admin/produits      → Liste des produits (protégé)
/admin/produits/new  → Créer un produit (protégé)
/admin/produits/:id  → Modifier un produit (protégé)
/admin/commandes     → Liste des commandes (protégé)
/admin/commandes/:id → Détail d'une commande (protégé)
/admin/contenu       → Gestion du contenu (protégé)
/admin/login         → Page de connexion Clerk
```

**FRs couvertes :** FR-002

---

## Data Architecture

### Data Model

```
┌─────────────────┐       ┌─────────────────┐
│    products      │       │   categories     │
├─────────────────┤       ├─────────────────┤
│ _id             │       │ _id             │
│ name            │◄──────│ name            │
│ description     │       │ slug            │
│ price           │       │ order           │
│ categoryId ─────┼───────│ _creationTime   │
│ images[]        │       └─────────────────┘
│ isActive        │
│ stock           │       ┌─────────────────┐
│ order           │       │    content       │
│ _creationTime   │       ├─────────────────┤
└────────┬────────┘       │ _id             │
         │                │ section         │
         │                │ data (object)   │
┌────────▼────────┐       │ _creationTime   │
│    orders        │       └─────────────────┘
├─────────────────┤
│ _id             │
│ orderNumber     │
│ items[] ────────┼──── [{productId, name, price, quantity}]
│ customer ───────┼──── {name, phone, address}
│ total           │
│ source          │       "whatsapp" | "form"
│ status          │       "new" | "processing" | "delivered" | "cancelled"
│ statusHistory[] │       [{status, timestamp}]
│ _creationTime   │
└─────────────────┘
```

### Database Design (Convex Schema)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()),       // URLs Cloudinary ou Convex Storage IDs
    isActive: v.boolean(),
    stock: v.optional(v.number()),
    order: v.optional(v.number()),      // Pour le tri
  })
    .index("by_category", ["categoryId"])
    .index("by_active", ["isActive"])
    .index("by_order", ["order"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    order: v.optional(v.number()),
  })
    .index("by_slug", ["slug"]),

  orders: defineTable({
    orderNumber: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      name: v.string(),              // Dénormalisé pour l'historique
      price: v.number(),
      quantity: v.number(),
    })),
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
    statusHistory: v.array(v.object({
      status: v.string(),
      timestamp: v.number(),
    })),
  })
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_orderNumber", ["orderNumber"]),

  content: defineTable({
    section: v.string(),              // "hero", "philosophy", "contact", "social"
    data: v.any(),                    // Structure flexible par section
  })
    .index("by_section", ["section"]),
});
```

### Détail des structures `content.data`

```typescript
// Section "hero"
{
  title: string,
  subtitle: string,
  backgroundImage: string,    // URL image
  ctaText: string,
  quote: string,
}

// Section "philosophy"
{
  title: string,
  pillars: [
    { title: string, description: string },
    { title: string, description: string },
    { title: string, description: string },
  ]
}

// Section "contact"
{
  phone: string,
  email: string,
  address: string,
  whatsappNumber: string,
}

// Section "social"
{
  instagram: string,
  facebook: string,
  whatsapp: string,
}
```

### Data Flow

```
ÉCRITURE (Admin) :
  Admin UI → useMutation() → Convex Mutation → Validation schéma → DB Write
                                    ↓
                              Vérif auth (ctx.auth.getUserIdentity())
                              Vérif rôle admin
                                    ↓
                              Subscription reactive → Tous les clients connectés

LECTURE (Site Vitrine) :
  Client UI → useQuery() → Convex Query → DB Read → Résultat réactif
                                                        ↓
                                                  Mise à jour auto si données changent

COMMANDE (Client) :
  Panier → useMutation("orders:create") → Convex Mutation → DB Write
                                                ↓
                                          Génération orderNumber
                                          Décrémentation stock
                                                ↓
                                          Admin voit la nouvelle commande en temps réel
```

---

## API Design

### API Architecture

**Type :** Fonctions Convex (ni REST ni GraphQL — modèle RPC typé)

Convex utilise un modèle d'appels de fonctions typées côté client :
- `useQuery("module:functionName", args)` — lectures réactives
- `useMutation("module:functionName")` — écritures

Les fonctions sont définies côté serveur dans le dossier `convex/` et automatiquement disponibles côté client avec le typage TypeScript complet.

**Authentification :** JWT Clerk validé par Convex via `ctx.auth.getUserIdentity()`

### Endpoints (Fonctions Convex)

#### Module : products

| Fonction | Type | Auth | Description |
|----------|------|------|-------------|
| `products:list` | Query | Public | Liste des produits actifs (site vitrine) |
| `products:listAdmin` | Query | Admin | Liste de tous les produits (admin) |
| `products:get` | Query | Public | Détail d'un produit par ID |
| `products:create` | Mutation | Admin | Créer un produit |
| `products:update` | Mutation | Admin | Modifier un produit |
| `products:remove` | Mutation | Admin | Supprimer un produit |
| `products:toggleActive` | Mutation | Admin | Activer/désactiver un produit |
| `products:reorder` | Mutation | Admin | Changer l'ordre d'affichage |
| `products:generateUploadUrl` | Mutation | Admin | Générer une URL d'upload Convex Storage |

#### Module : categories

| Fonction | Type | Auth | Description |
|----------|------|------|-------------|
| `categories:list` | Query | Public | Liste des catégories |
| `categories:create` | Mutation | Admin | Créer une catégorie |
| `categories:update` | Mutation | Admin | Renommer une catégorie |
| `categories:remove` | Mutation | Admin | Supprimer une catégorie |

#### Module : orders

| Fonction | Type | Auth | Description |
|----------|------|------|-------------|
| `orders:create` | Mutation | Public | Créer une commande (client) |
| `orders:list` | Query | Admin | Liste paginée des commandes avec filtres |
| `orders:get` | Query | Admin | Détail d'une commande |
| `orders:updateStatus` | Mutation | Admin | Changer le statut d'une commande |
| `orders:getStats` | Query | Admin | Statistiques agrégées |
| `orders:getNewCount` | Query | Admin | Nombre de nouvelles commandes (badge) |

#### Module : content

| Fonction | Type | Auth | Description |
|----------|------|------|-------------|
| `content:get` | Query | Public | Récupérer le contenu d'une section |
| `content:getAll` | Query | Public | Récupérer tout le contenu |
| `content:update` | Mutation | Admin | Modifier le contenu d'une section |

#### Module : stats

| Fonction | Type | Auth | Description |
|----------|------|------|-------------|
| `stats:dashboard` | Query | Admin | KPIs principaux (commandes, revenus, etc.) |
| `stats:topProducts` | Query | Admin | Top produits vendus |
| `stats:salesByPeriod` | Query | Admin | Ventes par période (graphique) |

### Authentication & Authorization

```typescript
// convex/auth.ts — Helper réutilisable
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Non authentifié");
  }
  // Vérifier le rôle admin via Clerk custom claims
  // ou via une table "admins" dans Convex
  return identity;
}
```

**Flux d'authentification :**
1. L'admin se connecte via `<SignIn />` de Clerk
2. Clerk émet un JWT
3. Le `ConvexProviderWithClerk` transmet le JWT à Convex
4. Chaque mutation/query admin appelle `requireAdmin(ctx)`
5. Convex valide le JWT via la config `auth.config.ts`

---

## Non-Functional Requirements Coverage

### NFR-001 : Performance - Interface Admin

**Requirement :** Les pages admin se chargent en < 3 secondes

**Architecture Solution :**
- Convex offre des queries réactives mises en cache côté client
- Le bundle admin est lazy-loaded (code splitting via React Router)
- Les données sont pré-fetchées par les subscriptions Convex

**Implementation Notes :**
- Utiliser `React.lazy()` pour les routes admin
- Les queries Convex sont automatiquement mises en cache et re-exécutées uniquement quand les données changent

**Validation :** Mesurer le FCP (First Contentful Paint) avec Chrome DevTools

---

### NFR-002 : Performance - Site Vitrine

**Requirement :** Le site vitrine se charge en < 2 secondes

**Architecture Solution :**
- Le site reste une SPA légère (bundle existant déjà optimisé)
- Les produits sont chargés via une query Convex unique (pas de cascade N+1)
- Images optimisées via Cloudinary (transformations URL : format webp, taille adaptée)
- Tailwind CSS (tree-shaking automatique via Vite)

**Implementation Notes :**
- Lazy loading des images avec `loading="lazy"`
- Skeleton loaders pendant le chargement Convex

**Validation :** Lighthouse score > 80 sur mobile

---

### NFR-003 : Sécurité - Authentification

**Requirement :** Authentification via Clerk avec sessions sécurisées

**Architecture Solution :**
- Clerk gère entièrement le cycle d'authentification (login, session, refresh)
- JWT tokens avec expiration automatique
- `ConvexProviderWithClerk` intègre l'auth dans le contexte Convex
- HTTPS obligatoire (Hostinger + Convex + Clerk)

**Validation :** Vérifier que les routes `/admin/*` redirigent vers le login sans token valide

---

### NFR-004 : Sécurité - Autorisation des mutations

**Requirement :** Toutes les mutations admin vérifient l'authentification côté serveur

**Architecture Solution :**
- Chaque mutation admin appelle `requireAdmin(ctx)` au début
- Les queries publiques (site vitrine) ne retournent que les produits actifs (`isActive: true`)
- La mutation `orders:create` est publique mais validée par le schéma Convex

**Implementation Notes :**
- Ne jamais faire confiance au client pour l'autorisation
- Le helper `requireAdmin()` est la seule source de vérité

**Validation :** Tests : appeler les mutations admin sans token → erreur attendue

---

### NFR-005 : Fiabilité - Indépendance site vitrine

**Requirement :** Le site vitrine reste accessible indépendamment de l'admin

**Architecture Solution :**
- Le site vitrine et l'admin sont dans la même SPA mais avec des routes indépendantes
- Les queries publiques ne dépendent pas de l'état de connexion admin
- Convex gère sa propre disponibilité (99.9% SLA)

**Implementation Notes :**
- Ajouter un error boundary React autour des composants qui consomment Convex
- Afficher un message gracieux si Convex est temporairement indisponible

**Validation :** Accéder au site vitrine sans être connecté → fonctionne normalement

---

### NFR-006 : Usabilité - Responsive Admin

**Requirement :** L'interface admin est utilisable sur desktop et tablette

**Architecture Solution :**
- Layout admin responsive avec Tailwind CSS (breakpoints md/lg)
- Navigation sidebar sur desktop, menu hamburger sur tablette
- Tableaux responsives (scroll horizontal ou stacking sur petits écrans)

**Validation :** Tester sur viewports 768px, 1024px, 1440px

---

### NFR-007 : Usabilité - Intuitivité

**Requirement :** Interface utilisable sans formation technique

**Architecture Solution :**
- Tous les labels et messages en français
- Toast notifications pour chaque action (succès/erreur)
- Modals de confirmation pour les actions destructives
- Navigation claire avec breadcrumbs
- Formulaires avec validation inline et messages d'erreur explicites

**Validation :** Test utilisateur : le propriétaire peut ajouter un produit sans aide

---

### NFR-008 : Compatibilité navigateurs

**Requirement :** Chrome, Safari, Firefox (2 dernières versions)

**Architecture Solution :**
- Vite avec `@vitejs/plugin-react` cible ES2022 (supporté par tous les navigateurs modernes)
- Tailwind CSS compatible tous navigateurs modernes
- Pas de polyfills nécessaires pour React 19

**Validation :** Tester sur Chrome, Safari, Firefox (desktop + mobile)

---

### NFR-009 : Maintenabilité - TypeScript strict

**Requirement :** Code TypeScript avec typage strict

**Architecture Solution :**
- `strict: true` dans `tsconfig.json` (à activer)
- Schémas Convex typés (validation à la compilation ET à l'exécution)
- Types partagés entre frontend et fonctions Convex via `convex/_generated/`
- Pas de `any` sauf cas justifiés

**Validation :** `npx tsc --noEmit` passe sans erreur

---

## Security Architecture

### Authentication

- **Méthode :** Clerk (OAuth 2.0 / email+password)
- **Token :** JWT avec expiration automatique (gérée par Clerk)
- **Refresh :** Transparent via le SDK Clerk React
- **MFA :** Non requis (single admin), activable dans Clerk si souhaité

### Authorization

- **Modèle :** Contrôle d'accès basé sur l'identité (identity-based)
- **Implémentation :** Le helper `requireAdmin(ctx)` vérifie que l'utilisateur est authentifié ET qu'il a le rôle admin
- **Stratégie de rôle :** Custom claim Clerk `role: "admin"` ou table `admins` dans Convex avec le `tokenIdentifier`

```typescript
// Option recommandée : table admins dans Convex
// convex/auth.ts
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Non authentifié");

  const admin = await ctx.db
    .query("admins")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!admin) throw new Error("Accès refusé");
  return identity;
}
```

### Data Encryption

- **En transit :** TLS 1.3 (Convex + Clerk + Hostinger HTTPS)
- **Au repos :** Convex chiffre les données au repos par défaut
- **Clés :** Gérées par Convex (pas de gestion de clés custom nécessaire)

### Security Best Practices

- Validation des entrées via les schémas Convex (`v.string()`, `v.number()`, etc.)
- Pas d'injection SQL possible (Convex n'utilise pas SQL)
- XSS : React échappe le HTML par défaut
- CSRF : Non applicable (Convex utilise WebSocket, pas de cookies de session)
- Rate limiting : Géré par Convex au niveau du free tier
- Variables d'environnement Convex pour les secrets (pas de secrets côté client)

---

## Scalability & Performance

### Scaling Strategy

- **Horizontale (automatique) :** Convex scale automatiquement les fonctions serveur
- **Base de données :** Convex gère la scalabilité de la DB de manière transparente
- **Frontend :** Fichiers statiques sur Hostinger (scalable par nature via CDN si activé)
- **Limites free tier :** 1M appels de fonctions/mois — largement suffisant pour une boutique locale

### Performance Optimization

- **Code splitting :** Routes admin lazy-loaded (`React.lazy`)
- **Queries optimisées :** Indexes Convex sur `categoryId`, `status`, `isActive`
- **Images :** Cloudinary avec transformations URL (format webp, taille adaptée)
- **Bundle :** Tailwind purgé automatiquement par Vite (tree-shaking)

### Caching Strategy

- **Convex côté client :** Cache automatique des résultats de queries, invalidé en temps réel
- **Navigateur :** Cache HTTP des assets statiques (JS, CSS, images) avec hashing Vite
- **Pas de cache serveur custom nécessaire** : Convex gère le caching côté serveur

### Load Balancing

- **Non applicable :** Convex et Clerk gèrent le load balancing en interne
- **Hostinger :** Serveur de fichiers statiques, pas de load balancing nécessaire

---

## Reliability & Availability

### High Availability Design

- **Convex :** Hébergé sur infrastructure cloud avec réplication
- **Clerk :** SaaS avec SLA de haute disponibilité
- **Hostinger :** Hébergement standard (uptime ~99.9%)
- **Pas de single point of failure côté application** : les 3 services sont indépendants

### Disaster Recovery

- **RPO :** Temps réel (Convex sauvegarde continuellement)
- **RTO :** Dépend des SLA Convex et Clerk (minutes)
- **Données :** Backup automatique par Convex
- **Code :** Versionné dans Git

### Backup Strategy

- **Base de données :** Backups automatiques par Convex (inclus dans le service)
- **Images :** Stockées sur Cloudinary (backup par le service)
- **Code source :** Git (recommandé : push vers GitHub/GitLab)
- **Configuration :** Variables d'environnement dans le dashboard Convex

### Monitoring & Alerting

- **Convex Dashboard :** Monitoring intégré (appels de fonctions, latence, erreurs, utilisation)
- **Clerk Dashboard :** Monitoring des connexions et utilisateurs
- **Navigateur :** Console errors + React Error Boundaries
- **Alerting :** Dashboard Convex pour surveiller l'approche des limites free tier

---

## Development Architecture

### Code Organization

```
boutique-mv/
├── index.html
├── index.tsx                    # Point d'entrée React
├── App.tsx                      # Router principal
├── vite.config.ts
├── tsconfig.json
├── package.json
│
├── convex/                      # Backend Convex
│   ├── _generated/              # Types auto-générés
│   ├── schema.ts                # Schéma de la base de données
│   ├── auth.config.ts           # Configuration Clerk
│   ├── auth.ts                  # Helpers d'authentification
│   ├── products.ts              # Fonctions produits
│   ├── categories.ts            # Fonctions catégories
│   ├── orders.ts                # Fonctions commandes
│   ├── content.ts               # Fonctions contenu
│   ├── stats.ts                 # Fonctions statistiques
│   └── seed.ts                  # Migration données initiales
│
├── src/                         # Frontend (nouveau dossier structuré)
│   ├── components/
│   │   ├── storefront/          # Composants site vitrine
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Philosophy.tsx
│   │   │   ├── Catalog.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── OrderForm.tsx    # Nouveau : formulaire de commande
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── admin/               # Composants admin
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   └── AdminHeader.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── KPICards.tsx
│   │   │   │   └── TopProducts.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductsListPage.tsx
│   │   │   │   ├── ProductFormPage.tsx
│   │   │   │   └── ImageUploader.tsx
│   │   │   ├── orders/
│   │   │   │   ├── OrdersListPage.tsx
│   │   │   │   └── OrderDetailPage.tsx
│   │   │   ├── content/
│   │   │   │   └── ContentEditorPage.tsx
│   │   │   └── categories/
│   │   │       └── CategoriesManager.tsx
│   │   │
│   │   └── ui/                  # Composants UI réutilisables
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── Table.tsx
│   │       ├── Skeleton.tsx
│   │       └── Badge.tsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useCart.ts
│   │   └── useToast.ts
│   │
│   ├── lib/                     # Utilitaires
│   │   ├── utils.ts
│   │   └── formatters.ts        # Formatage prix FCFA, dates
│   │
│   └── types.ts                 # Types partagés
│
├── docs/                        # Documentation BMAD
├── bmad/                        # Configuration BMAD
└── public/                      # Assets statiques
```

### Module Structure

| Module | Responsabilité | Dépendances |
|--------|----------------|-------------|
| `convex/` | Backend complet (DB, auth, logique) | Convex SDK, Clerk |
| `src/components/storefront/` | UI site vitrine | React, Convex hooks |
| `src/components/admin/` | UI administration | React, Convex hooks, Clerk components |
| `src/components/ui/` | Composants UI réutilisables | React, Tailwind |
| `src/hooks/` | Logique réutilisable (panier, toast) | React |

### Testing Strategy

| Type | Outil | Couverture |
|------|-------|-----------|
| **Schémas Convex** | Validation Convex native | 100% des entrées validées par les schémas typés |
| **Fonctions Convex** | Tests manuels via dashboard Convex | Fonctions critiques (auth, commandes) |
| **UI composants** | Tests manuels | Parcours utilisateur critiques |
| **TypeScript** | `tsc --noEmit` | 100% du code compilé sans erreur |

> Note : Pour un développeur unique avec budget free tier, les tests automatisés E2E ne sont pas prioritaires. La validation TypeScript stricte + les schémas Convex offrent un filet de sécurité suffisant pour le MVP.

### CI/CD Pipeline

**Pipeline simplifié (développeur unique) :**

```
1. Développement local
   ├── npx convex dev         (sync fonctions Convex en temps réel)
   └── npm run dev            (Vite dev server)

2. Vérification
   └── npx tsc --noEmit       (vérification TypeScript)

3. Déploiement
   ├── npx convex deploy      (déployer fonctions Convex en production)
   ├── npm run build          (build Vite → dossier dist/)
   └── Upload dist/ sur Hostinger (FTP ou interface Hostinger)
```

---

## Deployment Architecture

### Environments

| Environnement | Frontend | Backend Convex | Usage |
|---------------|----------|----------------|-------|
| **Development** | `localhost:3000` (Vite) | Convex dev (auto-sync) | Développement quotidien |
| **Production** | Hostinger (fichiers statiques) | Convex prod (déploiement explicite) | Site live |

### Deployment Strategy

1. **Backend (Convex) :** `npx convex deploy` — déploie les schémas et fonctions en production
2. **Frontend (Hostinger) :** `npm run build` puis upload du dossier `dist/` via FTP/interface Hostinger
3. **Variables d'environnement :**
   - `VITE_CONVEX_URL` : URL du déploiement Convex production
   - `VITE_CLERK_PUBLISHABLE_KEY` : Clé publique Clerk
   - Côté Convex : `CLERK_JWT_ISSUER_DOMAIN` (config auth)

### Infrastructure as Code

Non applicable — pas d'infrastructure custom à provisionner. Convex et Clerk sont des services managés configurés via leurs dashboards respectifs.

---

## Requirements Traceability

### Functional Requirements Coverage

| FR ID | Description | Composant(s) | Module Convex |
|-------|-------------|---------------|---------------|
| FR-001 | Connexion admin Clerk | Admin Login Page | auth.config.ts |
| FR-002 | Protection routes admin | React Router (ProtectedRoute) | auth.ts |
| FR-003 | Contrôle accès rôle admin | ProtectedRoute + Convex | auth.ts |
| FR-004 | Création de produit | ProductFormPage | products.ts |
| FR-005 | Modification de produit | ProductFormPage | products.ts |
| FR-006 | Suppression de produit | ProductsListPage | products.ts |
| FR-007 | Gestion catégories | CategoriesManager | categories.ts |
| FR-008 | Upload images | ImageUploader | products.ts (storage) |
| FR-009 | Activation/Désactivation produit | ProductsListPage | products.ts |
| FR-010 | Gestion stock | ProductFormPage | products.ts, orders.ts |
| FR-011 | Réordonnancement produits | ProductsListPage | products.ts |
| FR-012 | Formulaire commande intégré | OrderForm | orders.ts |
| FR-013 | Commande WhatsApp | CartDrawer (modifié) | orders.ts |
| FR-014 | Centralisation commandes Convex | — | orders.ts, schema.ts |
| FR-015 | Liste commandes + filtres | OrdersListPage | orders.ts |
| FR-016 | Gestion statuts commande | OrdersListPage, OrderDetailPage | orders.ts |
| FR-017 | Détail commande | OrderDetailPage | orders.ts |
| FR-018 | Notification nouvelle commande | AdminHeader (badge) | orders.ts |
| FR-019 | Export CSV | OrdersListPage | orders.ts |
| FR-020 | Modification section Hero | ContentEditorPage | content.ts |
| FR-021 | Modification section Philosophie | ContentEditorPage | content.ts |
| FR-022 | Modification infos contact | ContentEditorPage | content.ts |
| FR-023 | Modification liens sociaux | ContentEditorPage | content.ts |
| FR-024 | Bannières promotionnelles | ContentEditorPage | content.ts |
| FR-025 | Dashboard KPIs | DashboardPage, KPICards | stats.ts |
| FR-026 | Top produits vendus | TopProducts | stats.ts |
| FR-027 | Filtrage par période | DashboardPage | stats.ts |
| FR-028 | Graphique évolution ventes | DashboardPage | stats.ts |
| FR-029 | Affichage dynamique produits | Catalog, ProductDetail | products.ts |
| FR-030 | Affichage dynamique contenu | Hero, Philosophy, Footer | content.ts |
| FR-031 | États de chargement | Skeleton composants | — |
| FR-032 | Migration données | — | seed.ts |

**Couverture : 32/32 FRs (100%)**

### Non-Functional Requirements Coverage

| NFR ID | Description | Solution |
|--------|-------------|----------|
| NFR-001 | Perf admin < 3s | Code splitting + cache Convex |
| NFR-002 | Perf vitrine < 2s | Query unique + lazy images + Cloudinary |
| NFR-003 | Auth sécurisée Clerk | Clerk SDK + JWT |
| NFR-004 | Auth mutations serveur | `requireAdmin()` dans chaque mutation |
| NFR-005 | Indépendance vitrine | Queries publiques + Error Boundaries |
| NFR-006 | Responsive admin | Tailwind responsive (md/lg breakpoints) |
| NFR-007 | Intuitivité | Labels FR + toasts + confirmations |
| NFR-008 | Compatibilité navigateurs | ES2022 target + Vite |
| NFR-009 | TypeScript strict | `strict: true` + schémas Convex typés |

**Couverture : 9/9 NFRs (100%)**

---

## Trade-offs & Decision Log

### Décision 1 : SPA vs. Next.js

**Choix :** Rester en SPA React (Vite)
- (+) Pas de migration de framework
- (+) Déploiement statique simple sur Hostinger
- (+) Convex gère le backend (pas besoin d'API routes Next.js)
- (-) Pas de SSR (SEO limité)
**Justification :** La boutique est locale (Abidjan), le SEO n'est pas critique. La simplicité de déploiement prime.

### Décision 2 : Convex Storage vs. Cloudinary pour les images

**Choix :** Support des deux (Cloudinary existant + Convex Storage pour les nouveaux uploads)
- (+) Les images existantes (Cloudinary) restent fonctionnelles
- (+) Convex Storage simplifie le workflow d'upload dans l'admin
- (-) Deux sources d'images à gérer
**Justification :** Migration progressive — pas de refactoring immédiat nécessaire.

### Décision 3 : Table `admins` vs. Clerk Custom Claims pour l'autorisation

**Choix :** Table `admins` dans Convex
- (+) Contrôle total côté application
- (+) Pas besoin de configurer les metadata Clerk
- (+) Plus simple à tester
- (-) Une table de plus dans la DB
**Justification :** Plus flexible et indépendant de la configuration Clerk.

### Décision 4 : Restructuration du code en `src/`

**Choix :** Migrer les composants existants de la racine vers `src/`
- (+) Organisation claire (storefront vs. admin vs. ui)
- (+) Facilite la maintenance à long terme
- (-) Travail de refactoring initial (mise à jour des imports)
**Justification :** Avec 30+ stories à venir, une bonne organisation du code est essentielle.

---

## Open Issues & Risks

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Compatibilité Hostinger avec les routes SPA | Les routes `/admin/*` pourraient retourner 404 sur refresh | Configurer un fichier `.htaccess` pour rediriger toutes les routes vers `index.html` |
| Limites free tier Convex | Possible dépassement si le trafic augmente significativement | Surveiller via le dashboard Convex, prévoir l'upgrade |
| Tailwind via CDN | Le CDN Tailwind ne supporte pas le tree-shaking | Migrer vers Tailwind installé via npm (PostCSS) lors du setup |
| Variables d'environnement Hostinger | Hostinger n'injecte pas de variables d'env | Utiliser `VITE_*` variables build-time dans `.env.production` |

---

## Assumptions & Constraints

### Assumptions

- Convex free tier suffisant pour 12+ mois (< 1M appels/mois pour une boutique locale)
- Hostinger supporte les fichiers `.htaccess` pour le routing SPA
- Un seul administrateur (pas de gestion multi-rôles nécessaire)
- Le volume de commandes reste modéré (< 100/jour)
- Les images peuvent être stockées via Convex Storage ou Cloudinary

### Constraints

- Budget : 0€/mois pour les services backend (free tier only)
- Développeur unique : pas de parallélisation des tâches
- Stack existante : React + TypeScript + Vite (pas de migration framework)
- Hébergement : Hostinger (fichiers statiques uniquement)

---

## Future Considerations

- **Paiement Mobile Money :** Intégration future avec des APIs de paiement locales (Orange Money, Wave). L'architecture Convex permet d'ajouter des actions pour communiquer avec ces APIs.
- **Livraison intégrée :** Actions Convex pour appeler des APIs de livraison tierces.
- **Migration Next.js :** Si le SEO devient critique, migration possible vers Next.js avec Convex (Convex supporte Next.js nativement).
- **Multi-admin :** La table `admins` permet d'ajouter facilement d'autres administrateurs.
- **Notifications email :** Actions Convex pour envoyer des emails via Resend ou SendGrid.

---

## Approval & Sign-off

**Review Status:**
- [ ] Product Owner (ADMIN)

---

## Revision History

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0 | 2026-03-04 | ADMIN | Architecture initiale |

---

## Next Steps

### Phase 4 : Sprint Planning & Implémentation

Lancez `/bmad:sprint-planning` pour :
- Découper les 6 epics en user stories détaillées
- Estimer la complexité des stories
- Planifier les sprints
- Commencer l'implémentation

**Principes d'implémentation clés :**
1. Suivre les limites de composants définis dans ce document
2. Implémenter les solutions NFR telles que spécifiées
3. Utiliser la stack technique telle que définie
4. Respecter les schémas de données Convex
5. Appliquer les bonnes pratiques de sécurité et performance

---

**Ce document a été créé avec BMAD Method v6 - Phase 3 (Solutioning)**

*Pour continuer : Lancez `/bmad:workflow-status` pour voir votre progression et la prochaine étape recommandée.*

---

## Annexe A : Évaluation Technologique

| Critère | Convex | Supabase | Firebase |
|---------|--------|----------|----------|
| TypeScript natif | Excellent | Bon | Moyen |
| Temps réel | Natif (subscriptions) | Via Realtime | Via Firestore |
| Auth intégrée Clerk | Intégration officielle | Community | Non |
| Free tier | Généreux | Généreux | Généreux |
| Complexité setup | Faible | Moyenne | Moyenne |
| Vendor lock-in | Moyen | Faible (PostgreSQL) | Élevé |

**Choix : Convex** — Meilleure intégration Clerk, TypeScript natif, temps réel sans configuration.

---

## Annexe B : Capacity Planning

| Métrique | Estimation mensuelle | Limite Free Tier | Marge |
|----------|---------------------|-----------------|-------|
| Appels de fonctions | ~50K | 1M | 95% de marge |
| Stockage DB | ~10 Mo | 256 Mo | 96% de marge |
| File Storage | ~500 Mo | 1 Go | 50% de marge |
| Bande passante | ~5 Go | Inclus | OK |
| Utilisateurs Clerk (MAU) | 1 admin + ~100 visiteurs | 10 000 | 99% de marge |

---

## Annexe C : Estimation des Coûts

| Service | Plan | Coût mensuel |
|---------|------|-------------|
| Convex | Free | 0 FCFA |
| Clerk | Free | 0 FCFA |
| Cloudinary | Free | 0 FCFA |
| Hostinger | Existant | (déjà payé) |
| **Total** | | **0 FCFA** |

Si upgrade nécessaire (croissance) :
- Convex Pro : ~$25/mois (~15 000 FCFA)
- Clerk Pro : ~$25/mois (~15 000 FCFA)
