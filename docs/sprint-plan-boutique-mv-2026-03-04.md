# Sprint Plan: boutique-mv

**Date:** 2026-03-04
**Scrum Master:** ADMIN
**Project Level:** 3
**Total Stories:** 30
**Total Points:** 114
**Planned Sprints:** 4
**Target Completion:** 2026-04-28

---

## Executive Summary

Ce plan découpe les 6 epics du PRD en 30 user stories estimées à 114 points, réparties sur 4 sprints de 2 semaines. L'ordre de réalisation suit les dépendances techniques : infrastructure d'abord (Clerk + Convex), puis les fonctionnalités core (produits, commandes), enfin les fonctionnalités complémentaires (contenu, statistiques).

**Key Metrics:**
- Total Stories: 30
- Total Points: 114
- Sprints: 4 (2 semaines chacun)
- Team Capacity: 30 points/sprint
- Target Completion: Semaine du 28 avril 2026

---

## Story Inventory

---

### EPIC-001 : Setup & Infrastructure (22 points)

---

#### STORY-001 : Initialiser Convex dans le projet

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux intégrer Convex dans le projet React existant
Pour que l'application puisse communiquer avec un backend

**Acceptance Criteria:**
- [ ] `convex` et `convex-react` installés dans package.json
- [ ] `convex/schema.ts` créé avec les 4 tables (products, categories, orders, content)
- [ ] `ConvexProvider` wrappant l'application dans `index.tsx`
- [ ] `npx convex dev` démarre sans erreur et synchro le schéma
- [ ] Les types auto-générés dans `convex/_generated/` sont accessibles

**Technical Notes:**
- Installer : `npm install convex`
- Init : `npx convex init`
- Créer le schéma complet dès le départ (cf. architecture)
- Configurer `convex/tsconfig.json`

**Dependencies:** Aucune

**Points:** 3

---

#### STORY-002 : Intégrer Clerk pour l'authentification

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux intégrer Clerk dans le projet
Pour que l'authentification administrateur soit fonctionnelle

**Acceptance Criteria:**
- [ ] `@clerk/clerk-react` installé
- [ ] `ClerkProvider` configuré avec la publishable key
- [ ] `ConvexProviderWithClerk` remplace le `ConvexProvider` simple
- [ ] `convex/auth.config.ts` configuré avec le domaine Clerk
- [ ] La page de connexion Clerk fonctionne à `/admin/login`

**Technical Notes:**
- Créer un compte Clerk et un projet
- Récupérer `VITE_CLERK_PUBLISHABLE_KEY`
- Configurer l'issuer domain dans Convex

**Dependencies:** STORY-001

**Points:** 3

---

#### STORY-003 : Configurer React Router et structure des routes

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux mettre en place le routing avec React Router
Pour que la navigation entre site vitrine et admin fonctionne

**Acceptance Criteria:**
- [ ] `react-router-dom` installé
- [ ] Routes publiques : `/`, `/catalogue`, `/produit/:id`
- [ ] Routes admin protégées : `/admin/*`
- [ ] Composant `ProtectedRoute` qui redirige vers `/admin/login` si non authentifié
- [ ] Le ViewState existant est remplacé par le routing
- [ ] Les composants existants (Header, Hero, Catalog, etc.) sont migrés dans `src/components/storefront/`

**Technical Notes:**
- Migrer les composants de la racine vers `src/components/storefront/`
- Remplacer le `useState<ViewState>` par `<Routes>`
- Créer `AdminLayout` avec sidebar

**Dependencies:** STORY-002

**Points:** 5

---

#### STORY-004 : Helper d'authentification admin Convex

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux un helper `requireAdmin()` côté Convex
Pour que toutes les mutations admin vérifient l'autorisation

**Acceptance Criteria:**
- [ ] Fichier `convex/auth.ts` avec la fonction `requireAdmin(ctx)`
- [ ] Table `admins` dans le schéma avec index `by_tokenIdentifier`
- [ ] La fonction vérifie l'authentification ET le rôle admin
- [ ] Erreur claire si non authentifié ou non admin
- [ ] Script seed pour insérer l'admin initial

**Technical Notes:**
- Utiliser `ctx.auth.getUserIdentity()` pour récupérer l'identité
- Vérifier dans la table `admins` avec le `tokenIdentifier`

**Dependencies:** STORY-001, STORY-002

**Points:** 3

---

#### STORY-005 : Migration des données produits vers Convex

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux migrer les 5 produits hardcodés vers Convex
Pour que les données soient dynamiques

**Acceptance Criteria:**
- [ ] Script seed `convex/seed.ts` qui insère les 5 produits existants
- [ ] Les 2 catégories (Gourdes, Vêtements) sont créées
- [ ] Les URLs Cloudinary des images sont conservées
- [ ] Les données migrées sont identiques aux données hardcodées
- [ ] Le seed est idempotent (pas de doublons si exécuté 2 fois)

**Technical Notes:**
- Copier les données de `CATALOG_PRODUCTS` dans le seed
- Exécuter via `npx convex run seed:seedProducts`

**Dependencies:** STORY-001

**Points:** 2

---

#### STORY-006 : Seed du contenu initial

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux migrer le contenu actuel (hero, philosophie, contacts) vers Convex
Pour que le contenu soit éditable via l'admin

**Acceptance Criteria:**
- [ ] Contenu hero (titre, sous-titre, image, CTA, citation) inséré dans la table `content`
- [ ] Contenu philosophie (titre, 3 piliers) inséré
- [ ] Informations de contact (téléphone, email, adresse, WhatsApp) insérées
- [ ] Liens sociaux insérés
- [ ] Le seed est idempotent

**Technical Notes:**
- Extraire les textes actuels des composants Hero, Philosophy, Footer
- Insérer dans la table `content` avec les sections correspondantes

**Dependencies:** STORY-001

**Points:** 2

---

#### STORY-007 : Installer Tailwind CSS via npm

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux migrer Tailwind CSS du CDN vers une installation npm
Pour bénéficier du tree-shaking et des performances optimales

**Acceptance Criteria:**
- [ ] Tailwind CSS installé via npm (avec PostCSS et Autoprefixer)
- [ ] Fichier `tailwind.config.js` créé avec les paths de contenu
- [ ] Le CDN Tailwind est retiré de `index.html`
- [ ] Tous les styles existants fonctionnent identiquement
- [ ] Le build production ne contient que le CSS utilisé

**Technical Notes:**
- `npm install -D tailwindcss @tailwindcss/vite`
- Configurer Vite plugin
- Créer `src/index.css` avec les directives Tailwind

**Dependencies:** Aucune

**Points:** 2

---

#### STORY-008 : Layout admin (sidebar + header)

**Epic:** EPIC-001 - Setup & Infrastructure
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux une interface d'administration avec une navigation claire
Pour que je puisse accéder facilement à toutes les sections

**Acceptance Criteria:**
- [ ] `AdminLayout` avec sidebar latérale (desktop) et header
- [ ] Navigation : Dashboard, Produits, Commandes, Contenu
- [ ] Bouton déconnexion via `<UserButton />` de Clerk
- [ ] Sidebar responsive (collapse sur tablette)
- [ ] Highlight de la section active dans la navigation
- [ ] Labels en français

**Technical Notes:**
- Utiliser les icônes `lucide-react` pour la navigation
- Tailwind pour le layout responsive

**Dependencies:** STORY-003

**Points:** 5

---

### EPIC-002 : Gestion des Produits (24 points)

---

#### STORY-009 : Fonctions Convex CRUD produits

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux les fonctions Convex de gestion des produits
Pour que l'admin puisse créer, modifier et supprimer des produits

**Acceptance Criteria:**
- [ ] Query `products:list` (public, produits actifs uniquement)
- [ ] Query `products:listAdmin` (auth, tous les produits)
- [ ] Query `products:get` (public, par ID)
- [ ] Mutation `products:create` (auth admin)
- [ ] Mutation `products:update` (auth admin)
- [ ] Mutation `products:remove` (auth admin, avec confirmation)
- [ ] Mutation `products:toggleActive` (auth admin)
- [ ] Toutes les mutations utilisent `requireAdmin(ctx)`

**Technical Notes:**
- Fichier `convex/products.ts`
- Validation des champs via les validators Convex (`v.string()`, etc.)

**Dependencies:** STORY-004

**Points:** 5

---

#### STORY-010 : Fonctions Convex CRUD catégories

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux les fonctions Convex de gestion des catégories
Pour que l'admin puisse organiser les produits par catégorie

**Acceptance Criteria:**
- [ ] Query `categories:list` (public)
- [ ] Mutation `categories:create` (auth admin)
- [ ] Mutation `categories:update` (auth admin)
- [ ] Mutation `categories:remove` (auth admin, avec vérification produits liés)
- [ ] Génération automatique du slug depuis le nom

**Technical Notes:**
- Fichier `convex/categories.ts`
- Empêcher la suppression d'une catégorie qui contient des produits

**Dependencies:** STORY-004

**Points:** 3

---

#### STORY-011 : Page liste des produits (admin)

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux voir la liste de tous mes produits
Pour que je puisse les gérer facilement

**Acceptance Criteria:**
- [ ] Tableau/grille de tous les produits (actifs et inactifs)
- [ ] Colonnes : image miniature, nom, catégorie, prix, stock, statut (actif/inactif)
- [ ] Boutons d'action : modifier, supprimer, activer/désactiver
- [ ] Bouton "Nouveau produit" en haut
- [ ] Confirmation avant suppression (modal)
- [ ] Toast de succès/erreur après chaque action

**Technical Notes:**
- `src/components/admin/products/ProductsListPage.tsx`
- Utiliser `useQuery("products:listAdmin")`

**Dependencies:** STORY-008, STORY-009

**Points:** 5

---

#### STORY-012 : Formulaire création/modification de produit

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux un formulaire pour créer et modifier mes produits
Pour que je puisse gérer mon catalogue sans toucher au code

**Acceptance Criteria:**
- [ ] Formulaire avec champs : nom, description, prix (FCFA), catégorie (select), stock
- [ ] Mode création et mode édition (même composant)
- [ ] Validation des champs obligatoires (nom, prix, catégorie)
- [ ] Le prix est formaté en FCFA
- [ ] Boutons : Sauvegarder, Annuler
- [ ] Redirection vers la liste après sauvegarde
- [ ] Toast de confirmation

**Technical Notes:**
- `src/components/admin/products/ProductFormPage.tsx`
- En mode édition, pré-remplir avec `useQuery("products:get", { id })`

**Dependencies:** STORY-009, STORY-010

**Points:** 5

---

#### STORY-013 : Upload d'images produit

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux uploader des images pour mes produits
Pour que chaque produit ait des photos attractives

**Acceptance Criteria:**
- [ ] Zone d'upload par glisser-déposer ou sélection de fichier
- [ ] Prévisualisation de l'image avant sauvegarde
- [ ] Support JPG, PNG, WebP (max 5 Mo)
- [ ] Possibilité d'ajouter plusieurs images (galerie)
- [ ] Possibilité de supprimer une image existante
- [ ] Images stockées via Convex Storage (`generateUploadUrl`)

**Technical Notes:**
- `src/components/admin/products/ImageUploader.tsx`
- Utiliser `useMutation("products:generateUploadUrl")` pour l'upload
- Stocker l'ID du storage dans le champ `images[]` du produit

**Dependencies:** STORY-012

**Points:** 5

---

#### STORY-014 : Gestionnaire de catégories (admin)

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux gérer mes catégories de produits
Pour que mon catalogue soit bien organisé

**Acceptance Criteria:**
- [ ] Liste des catégories existantes
- [ ] Formulaire inline pour ajouter une catégorie
- [ ] Bouton renommer (édition inline)
- [ ] Bouton supprimer avec avertissement si des produits sont associés
- [ ] Affichage du nombre de produits par catégorie

**Technical Notes:**
- `src/components/admin/categories/CategoriesManager.tsx`
- Peut être intégré dans la page produits ou comme page séparée

**Dependencies:** STORY-010, STORY-008

**Points:** 3

---

### EPIC-003 : Système de Commandes (22 points)

---

#### STORY-015 : Fonctions Convex commandes

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux les fonctions Convex de gestion des commandes
Pour que les commandes soient centralisées dans la base de données

**Acceptance Criteria:**
- [ ] Mutation `orders:create` (public — pour les clients)
- [ ] Query `orders:list` (auth admin, paginée avec filtres)
- [ ] Query `orders:get` (auth admin, détail par ID)
- [ ] Mutation `orders:updateStatus` (auth admin)
- [ ] Query `orders:getNewCount` (auth admin, compteur nouvelles commandes)
- [ ] Génération automatique du `orderNumber` (ex: BMV-2026-0001)
- [ ] Historique des statuts avec timestamps

**Technical Notes:**
- Fichier `convex/orders.ts`
- `orders:create` est public mais valide le schéma strictement
- Décrémenter le stock du produit lors de la création (si stock géré)

**Dependencies:** STORY-004, STORY-009

**Points:** 5

---

#### STORY-016 : Formulaire de commande intégré (site vitrine)

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Must Have

**User Story:**
En tant que client
Je veux pouvoir passer commande via un formulaire sur le site
Pour que ma commande soit enregistrée directement

**Acceptance Criteria:**
- [ ] Formulaire dans le panier : nom, téléphone, adresse de livraison
- [ ] Validation des champs obligatoires
- [ ] Soumission via `useMutation("orders:create")`
- [ ] Confirmation de commande avec numéro de commande
- [ ] Le panier est vidé après commande réussie
- [ ] Info livraison (1500-3000 FCFA) affichée

**Technical Notes:**
- `src/components/storefront/OrderForm.tsx`
- Intégré dans ou à côté du `CartDrawer` existant

**Dependencies:** STORY-015

**Points:** 5

---

#### STORY-017 : Modification du bouton WhatsApp

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Must Have

**User Story:**
En tant que client
Je veux que ma commande soit enregistrée quand je commande via WhatsApp
Pour que le suivi soit centralisé

**Acceptance Criteria:**
- [ ] Le bouton "Commander sur WhatsApp" enregistre d'abord la commande dans Convex
- [ ] Source de la commande marquée comme "whatsapp"
- [ ] Ensuite, ouverture de WhatsApp avec le message pré-formaté (comportement existant)
- [ ] Si l'enregistrement échoue, afficher une erreur mais ouvrir WhatsApp quand même
- [ ] La commande apparaît dans le dashboard admin

**Technical Notes:**
- Modifier `CartDrawer.tsx` pour appeler `orders:create` avant `window.open(wa.me/...)`
- Ajouter `source: "whatsapp"` dans les données de la commande

**Dependencies:** STORY-015

**Points:** 3

---

#### STORY-018 : Page liste des commandes (admin)

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux voir la liste de toutes les commandes
Pour que je puisse suivre et gérer les commandes

**Acceptance Criteria:**
- [ ] Tableau paginé des commandes (plus récentes en premier)
- [ ] Colonnes : numéro, date, client, montant, statut (badge couleur), source
- [ ] Filtres : par statut, par source (WhatsApp/formulaire)
- [ ] Clic sur une commande → page détail
- [ ] Badge de compteur pour les nouvelles commandes

**Technical Notes:**
- `src/components/admin/orders/OrdersListPage.tsx`
- Badges couleur : Nouvelle (bleu), En cours (orange), Livrée (vert), Annulée (rouge)

**Dependencies:** STORY-008, STORY-015

**Points:** 5

---

#### STORY-019 : Page détail d'une commande (admin)

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux voir le détail complet d'une commande
Pour que je puisse traiter la commande correctement

**Acceptance Criteria:**
- [ ] Détail des articles : image, nom, quantité, prix unitaire, sous-total
- [ ] Informations client : nom, téléphone, adresse
- [ ] Total de la commande
- [ ] Source et date
- [ ] Sélecteur de statut (dropdown ou boutons) pour changer le statut
- [ ] Historique des changements de statut avec timestamps
- [ ] Bouton retour vers la liste

**Technical Notes:**
- `src/components/admin/orders/OrderDetailPage.tsx`
- Utiliser `useQuery("orders:get", { id })` et `useMutation("orders:updateStatus")`

**Dependencies:** STORY-018

**Points:** 5

---

### EPIC-004 : Gestion du Contenu (12 points)

---

#### STORY-020 : Fonctions Convex contenu

**Epic:** EPIC-004 - Gestion du Contenu
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux les fonctions Convex de gestion du contenu
Pour que le contenu du site soit éditable

**Acceptance Criteria:**
- [ ] Query `content:get` (public, par section)
- [ ] Query `content:getAll` (public, tout le contenu)
- [ ] Mutation `content:update` (auth admin, par section)
- [ ] Sections supportées : "hero", "philosophy", "contact", "social"

**Technical Notes:**
- Fichier `convex/content.ts`

**Dependencies:** STORY-004

**Points:** 2

---

#### STORY-021 : Page gestion du contenu (admin)

**Epic:** EPIC-004 - Gestion du Contenu
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux modifier le contenu de mon site vitrine
Pour que je puisse mettre à jour les textes et images sans toucher au code

**Acceptance Criteria:**
- [ ] Section Hero : titre, sous-titre, texte CTA, citation, image de fond
- [ ] Section Philosophie : titre, 3 piliers (titre + description)
- [ ] Section Contact : téléphone, email, adresse, numéro WhatsApp
- [ ] Section Réseaux sociaux : URLs Instagram, Facebook, WhatsApp
- [ ] Bouton "Sauvegarder" par section
- [ ] Toast de confirmation après sauvegarde
- [ ] Labels en français

**Technical Notes:**
- `src/components/admin/content/ContentEditorPage.tsx`
- Un formulaire par section avec accordéon ou tabs

**Dependencies:** STORY-008, STORY-020

**Points:** 5

---

#### STORY-022 : Upload image hero

**Epic:** EPIC-004 - Gestion du Contenu
**Priority:** Should Have

**User Story:**
En tant qu'admin
Je veux pouvoir changer l'image de fond du hero
Pour que la page d'accueil soit toujours attractive

**Acceptance Criteria:**
- [ ] Zone d'upload dans la section Hero de l'éditeur de contenu
- [ ] Prévisualisation de l'image actuelle
- [ ] Upload via Convex Storage
- [ ] L'image se met à jour sur le site vitrine immédiatement

**Technical Notes:**
- Réutiliser le composant `ImageUploader` de STORY-013

**Dependencies:** STORY-013, STORY-021

**Points:** 2

---

#### STORY-023 : Bannières promotionnelles

**Epic:** EPIC-004 - Gestion du Contenu
**Priority:** Could Have

**User Story:**
En tant qu'admin
Je veux ajouter des bannières promotionnelles sur mon site
Pour que je puisse mettre en avant des offres spéciales

**Acceptance Criteria:**
- [ ] Création de bannière : texte, couleur de fond
- [ ] Activation/désactivation de la bannière
- [ ] Affichage en haut du site vitrine quand activée
- [ ] Possibilité de supprimer une bannière

**Technical Notes:**
- Ajouter une section "banner" dans la table `content`
- Composant `Banner.tsx` dans le storefront

**Dependencies:** STORY-020

**Points:** 3

---

### EPIC-005 : Dashboard & Statistiques (14 points)

---

#### STORY-024 : Fonctions Convex statistiques

**Epic:** EPIC-005 - Dashboard & Statistiques
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux les fonctions Convex de statistiques
Pour que le dashboard admin affiche des métriques pertinentes

**Acceptance Criteria:**
- [ ] Query `stats:dashboard` : total commandes, revenus, commandes du jour, produits actifs
- [ ] Query `stats:topProducts` : top 10 produits par ventes
- [ ] Query `stats:salesByPeriod` : ventes agrégées par jour/semaine (pour graphique)
- [ ] Support du filtrage par période (today, 7d, 30d, custom)

**Technical Notes:**
- Fichier `convex/stats.ts`
- Utiliser les indexes Convex pour les requêtes performantes

**Dependencies:** STORY-015

**Points:** 5

---

#### STORY-025 : Dashboard admin — KPIs et top produits

**Epic:** EPIC-005 - Dashboard & Statistiques
**Priority:** Must Have

**User Story:**
En tant qu'admin
Je veux voir un tableau de bord avec mes métriques clés
Pour que je puisse suivre la performance de ma boutique

**Acceptance Criteria:**
- [ ] 4 cartes KPI : commandes totales, revenus total (FCFA), commandes du jour, produits actifs
- [ ] Tableau/liste des top 10 produits vendus
- [ ] Données en temps réel (mise à jour automatique via Convex)
- [ ] Le dashboard est la page d'accueil de l'admin (`/admin`)

**Technical Notes:**
- `src/components/admin/dashboard/DashboardPage.tsx`
- `src/components/admin/dashboard/KPICards.tsx`
- `src/components/admin/dashboard/TopProducts.tsx`

**Dependencies:** STORY-008, STORY-024

**Points:** 5

---

#### STORY-026 : Filtrage par période

**Epic:** EPIC-005 - Dashboard & Statistiques
**Priority:** Should Have

**User Story:**
En tant qu'admin
Je veux filtrer les statistiques par période
Pour que je puisse analyser les performances sur différentes échelles de temps

**Acceptance Criteria:**
- [ ] Sélecteur de période : Aujourd'hui, 7 jours, 30 jours
- [ ] Tous les KPIs se mettent à jour selon la période sélectionnée
- [ ] Le top produits se met à jour selon la période
- [ ] La période sélectionnée est visuellement indiquée

**Technical Notes:**
- Passer la période comme argument aux queries stats

**Dependencies:** STORY-025

**Points:** 2

---

#### STORY-027 : Graphique d'évolution des ventes

**Epic:** EPIC-005 - Dashboard & Statistiques
**Priority:** Could Have

**User Story:**
En tant qu'admin
Je veux voir un graphique de l'évolution de mes ventes
Pour que je puisse identifier les tendances

**Acceptance Criteria:**
- [ ] Graphique en barres ou lignes montrant les ventes par jour
- [ ] Axes : temps (x), revenus en FCFA (y)
- [ ] Responsive sur desktop et tablette
- [ ] Se met à jour avec le filtre de période

**Technical Notes:**
- Utiliser une bibliothèque de graphiques légère (recharts ou chart.js)
- Ou SVG/Canvas custom si on veut éviter une dépendance

**Dependencies:** STORY-024

**Points:** 3

---

### EPIC-006 : Adaptation Site Vitrine (18 points)

---

#### STORY-028 : Catalogue dynamique depuis Convex

**Epic:** EPIC-006 - Adaptation Site Vitrine
**Priority:** Must Have

**User Story:**
En tant que client
Je veux voir les produits à jour sur le site
Pour que je puisse acheter les produits disponibles

**Acceptance Criteria:**
- [ ] Le composant `Catalog` utilise `useQuery("products:list")` au lieu des données hardcodées
- [ ] Les filtres par catégorie utilisent `useQuery("categories:list")`
- [ ] Le composant `ProductDetail` utilise `useQuery("products:get", { id })`
- [ ] Skeleton loaders pendant le chargement
- [ ] Message "Aucun produit trouvé" si le catalogue est vide
- [ ] Les données hardcodées dans `App.tsx` sont supprimées

**Technical Notes:**
- Adapter les composants existants pour recevoir les données via hooks Convex
- Gérer les images : afficher depuis Convex Storage ou Cloudinary selon le type d'URL

**Dependencies:** STORY-005, STORY-009

**Points:** 5

---

#### STORY-029 : Contenu dynamique du site vitrine

**Epic:** EPIC-006 - Adaptation Site Vitrine
**Priority:** Must Have

**User Story:**
En tant que client
Je veux voir le contenu à jour du site
Pour que les informations soient toujours actuelles

**Acceptance Criteria:**
- [ ] `Hero` utilise `useQuery("content:get", { section: "hero" })`
- [ ] `Philosophy` utilise `useQuery("content:get", { section: "philosophy" })`
- [ ] `Footer` utilise `useQuery("content:get", { section: "contact" })` et `"social"`
- [ ] Fallback sur des valeurs par défaut si le contenu n'est pas encore configuré
- [ ] Skeleton loaders pendant le chargement
- [ ] Les données hardcodées dans les composants sont supprimées

**Technical Notes:**
- Adapter Hero.tsx, Philosophy.tsx, Footer.tsx
- Le Header utilise les informations de contact pour le lien WhatsApp

**Dependencies:** STORY-006, STORY-020

**Points:** 5

---

#### STORY-030 : Composants UI réutilisables

**Epic:** EPIC-006 - Adaptation Site Vitrine
**Priority:** Must Have

**User Story:**
En tant que développeur
Je veux des composants UI réutilisables
Pour que l'interface soit cohérente entre le site vitrine et l'admin

**Acceptance Criteria:**
- [ ] Composant `Button` (variantes : primary, secondary, danger, ghost)
- [ ] Composant `Input` (avec label, erreur, aide)
- [ ] Composant `Modal` (confirmation, formulaire)
- [ ] Composant `Toast` (succès, erreur, info)
- [ ] Composant `Skeleton` (loading placeholder)
- [ ] Composant `Badge` (statuts colorés)
- [ ] Tous les composants sont en français et responsive

**Technical Notes:**
- `src/components/ui/`
- Tailwind pour le styling
- Le Toast existant peut être adapté

**Dependencies:** STORY-007

**Points:** 5

---

#### STORY-EXP-001 : Export CSV des commandes

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Could Have

**User Story:**
En tant qu'admin
Je veux exporter mes commandes en CSV
Pour que je puisse les analyser dans Excel

**Acceptance Criteria:**
- [ ] Bouton "Exporter CSV" sur la page des commandes
- [ ] Le fichier contient : date, numéro, client, articles, montant, statut, source
- [ ] Les filtres actifs s'appliquent à l'export

**Technical Notes:**
- Génération CSV côté client (pas besoin de fonction Convex spécifique)

**Dependencies:** STORY-018

**Points:** 2

---

#### STORY-EXP-002 : Notification badge nouvelles commandes

**Epic:** EPIC-003 - Système de Commandes
**Priority:** Should Have

**User Story:**
En tant qu'admin
Je veux être alerté des nouvelles commandes
Pour que je puisse les traiter rapidement

**Acceptance Criteria:**
- [ ] Badge rouge avec compteur sur "Commandes" dans la sidebar admin
- [ ] Le compteur affiche le nombre de commandes avec statut "new"
- [ ] Le compteur se met à jour en temps réel
- [ ] Le compteur disparaît quand toutes les commandes sont consultées

**Technical Notes:**
- Utiliser `useQuery("orders:getNewCount")` dans `AdminSidebar`

**Dependencies:** STORY-008, STORY-015

**Points:** 2

---

#### STORY-EXP-003 : Réordonnancement des produits

**Epic:** EPIC-002 - Gestion des Produits
**Priority:** Could Have

**User Story:**
En tant qu'admin
Je veux réordonner mes produits par glisser-déposer
Pour que je contrôle l'ordre d'affichage sur le site

**Acceptance Criteria:**
- [ ] Drag & drop sur la liste des produits admin
- [ ] L'ordre est sauvegardé via `products:reorder`
- [ ] Le catalogue respecte l'ordre défini

**Technical Notes:**
- Nécessite une bibliothèque de drag & drop (dnd-kit ou @hello-pangea/dnd)

**Dependencies:** STORY-011

**Points:** 3

---

## Sprint Allocation

---

### Sprint 1 (Semaines 1-2) — 28/30 points

**Objectif :** Mettre en place toute l'infrastructure technique (Convex, Clerk, Router, Tailwind) et migrer les données existantes. À la fin du sprint, le site vitrine fonctionne avec les données Convex.

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-007 | Installer Tailwind CSS via npm | 2 | Must |
| STORY-001 | Initialiser Convex | 3 | Must |
| STORY-002 | Intégrer Clerk | 3 | Must |
| STORY-004 | Helper auth admin Convex | 3 | Must |
| STORY-005 | Migration données produits | 2 | Must |
| STORY-006 | Seed contenu initial | 2 | Must |
| STORY-003 | React Router + structure routes | 5 | Must |
| STORY-008 | Layout admin (sidebar + header) | 5 | Must |
| STORY-030 | Composants UI réutilisables | 5 | Must |

**Total : 30 points (100% capacité)**

**Risques :**
- Configuration Clerk-Convex (première intégration)
- Migration des composants existants vers `src/`

---

### Sprint 2 (Semaines 3-4) — 28/30 points

**Objectif :** Livrer la gestion complète des produits (CRUD) et adapter le site vitrine pour afficher les données dynamiques depuis Convex.

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-009 | Fonctions Convex CRUD produits | 5 | Must |
| STORY-010 | Fonctions Convex CRUD catégories | 3 | Must |
| STORY-011 | Page liste des produits (admin) | 5 | Must |
| STORY-012 | Formulaire création/modification produit | 5 | Must |
| STORY-013 | Upload d'images produit | 5 | Must |
| STORY-014 | Gestionnaire de catégories | 3 | Must |
| STORY-028 | Catalogue dynamique depuis Convex | 5 | Must |

**Total : 31 points (103% — serré mais réalisable)**

**Risques :**
- Upload d'images via Convex Storage (complexité)

---

### Sprint 3 (Semaines 5-6) — 28/30 points

**Objectif :** Livrer le système de commandes complet (formulaire + WhatsApp) et la gestion des commandes dans l'admin.

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-015 | Fonctions Convex commandes | 5 | Must |
| STORY-016 | Formulaire de commande intégré | 5 | Must |
| STORY-017 | Modification bouton WhatsApp | 3 | Must |
| STORY-018 | Page liste des commandes (admin) | 5 | Must |
| STORY-019 | Page détail commande (admin) | 5 | Must |
| STORY-029 | Contenu dynamique site vitrine | 5 | Must |

**Total : 28 points (93%)**

**Risques :**
- Coordination formulaire + WhatsApp pour la centralisation

---

### Sprint 4 (Semaines 7-8) — 28/30 points

**Objectif :** Livrer le dashboard statistiques, l'éditeur de contenu et les fonctionnalités bonus. Préparer le déploiement sur Hostinger.

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-020 | Fonctions Convex contenu | 2 | Must |
| STORY-021 | Page gestion contenu (admin) | 5 | Must |
| STORY-024 | Fonctions Convex statistiques | 5 | Must |
| STORY-025 | Dashboard KPIs + top produits | 5 | Must |
| STORY-026 | Filtrage par période | 2 | Should |
| STORY-022 | Upload image hero | 2 | Should |
| STORY-EXP-002 | Badge nouvelles commandes | 2 | Should |
| STORY-027 | Graphique évolution ventes | 3 | Could |
| STORY-EXP-001 | Export CSV commandes | 2 | Could |

**Total : 28 points (93%)**

**Risques :**
- Les Could Have peuvent être reportés si le sprint est chargé

---

### Backlog (non planifié)

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-023 | Bannières promotionnelles | 3 | Could |
| STORY-EXP-003 | Réordonnancement produits | 3 | Could |

**Total backlog : 6 points** — à intégrer dans un sprint futur si capacité disponible.

---

## Epic Traceability

| Epic ID | Nom | Stories | Points | Sprint(s) |
|---------|-----|---------|--------|-----------|
| EPIC-001 | Setup & Infrastructure | STORY-001 à 008, 030 | 30 | Sprint 1 |
| EPIC-002 | Gestion des Produits | STORY-009 à 014, EXP-003 | 27 | Sprint 2 (+backlog) |
| EPIC-003 | Système de Commandes | STORY-015 à 019, EXP-001, EXP-002 | 27 | Sprint 3-4 |
| EPIC-004 | Gestion du Contenu | STORY-020 à 023 | 12 | Sprint 3-4 (+backlog) |
| EPIC-005 | Dashboard & Statistiques | STORY-024 à 027 | 15 | Sprint 4 |
| EPIC-006 | Adaptation Site Vitrine | STORY-028, 029 | 10 | Sprint 2-3 |

---

## Functional Requirements Coverage

| FR | Description | Story | Sprint |
|----|-------------|-------|--------|
| FR-001 | Connexion admin Clerk | STORY-002 | 1 |
| FR-002 | Protection routes admin | STORY-003 | 1 |
| FR-003 | Contrôle accès rôle admin | STORY-004 | 1 |
| FR-004 | Création de produit | STORY-012 | 2 |
| FR-005 | Modification de produit | STORY-012 | 2 |
| FR-006 | Suppression de produit | STORY-011 | 2 |
| FR-007 | Gestion catégories | STORY-014 | 2 |
| FR-008 | Upload images produit | STORY-013 | 2 |
| FR-009 | Activation/Désactivation produit | STORY-009, 011 | 2 |
| FR-010 | Gestion stock | STORY-012 | 2 |
| FR-011 | Réordonnancement produits | STORY-EXP-003 | Backlog |
| FR-012 | Formulaire commande intégré | STORY-016 | 3 |
| FR-013 | Commande WhatsApp conservé | STORY-017 | 3 |
| FR-014 | Centralisation commandes Convex | STORY-015 | 3 |
| FR-015 | Liste commandes + filtres | STORY-018 | 3 |
| FR-016 | Gestion statuts commande | STORY-019 | 3 |
| FR-017 | Détail commande | STORY-019 | 3 |
| FR-018 | Notification nouvelle commande | STORY-EXP-002 | 4 |
| FR-019 | Export CSV | STORY-EXP-001 | 4 |
| FR-020 | Modification Hero | STORY-021 | 4 |
| FR-021 | Modification Philosophie | STORY-021 | 4 |
| FR-022 | Modification contacts | STORY-021 | 4 |
| FR-023 | Modification liens sociaux | STORY-021 | 4 |
| FR-024 | Bannières promotionnelles | STORY-023 | Backlog |
| FR-025 | Dashboard KPIs | STORY-025 | 4 |
| FR-026 | Top produits vendus | STORY-025 | 4 |
| FR-027 | Filtrage par période | STORY-026 | 4 |
| FR-028 | Graphique ventes | STORY-027 | 4 |
| FR-029 | Affichage dynamique produits | STORY-028 | 2 |
| FR-030 | Affichage dynamique contenu | STORY-029 | 3 |
| FR-031 | États de chargement | STORY-028, 029, 030 | 2-3 |
| FR-032 | Migration données | STORY-005, 006 | 1 |

**Couverture : 32/32 FRs (100%)** — dont 2 dans le backlog (Could Have)

---

## Risks and Mitigation

**Haut :**
- Intégration Clerk + Convex + React Router dans le projet existant — **Mitigation :** STORY-001 à 003 sont isolées et se font en séquence, suivre la doc officielle
- Sprint 2 légèrement surchargé (31 pts) — **Mitigation :** STORY-014 (catégories) peut être reporté au Sprint 3 si nécessaire

**Moyen :**
- Upload d'images Convex Storage (STORY-013) — **Mitigation :** Documenter le flux upload, tester tôt
- Déploiement Hostinger avec routing SPA — **Mitigation :** Configurer `.htaccess` dès le Sprint 1

**Bas :**
- Limites free tier Convex — **Mitigation :** Volume très faible, surveiller via dashboard
- Complexité graphique ventes (STORY-027) — **Mitigation :** Could Have, reportable

---

## Definition of Done

Pour qu'une story soit considérée terminée :
- [ ] Code implémenté et commité
- [ ] TypeScript compile sans erreur (`npx tsc --noEmit`)
- [ ] Fonctionnalité testée manuellement
- [ ] UI responsive (desktop + tablette pour l'admin)
- [ ] Labels et messages en français
- [ ] Critères d'acceptation validés
- [ ] Pas de régression sur les fonctionnalités existantes

---

## Next Steps

**Immédiat :** Commencer le Sprint 1

Lancez `/bmad:dev-story` avec l'ID d'une story pour commencer l'implémentation. Ordre recommandé pour le Sprint 1 :

1. `STORY-007` — Installer Tailwind via npm (indépendant)
2. `STORY-001` — Initialiser Convex
3. `STORY-005` + `STORY-006` — Seed des données
4. `STORY-002` — Intégrer Clerk
5. `STORY-004` — Helper auth admin
6. `STORY-003` — React Router + restructuration
7. `STORY-030` — Composants UI
8. `STORY-008` — Layout admin

---

**Ce plan a été créé avec BMAD Method v6 - Phase 4 (Implementation Planning)**

*Pour continuer : Lancez `/bmad:workflow-status` pour voir votre progression.*
