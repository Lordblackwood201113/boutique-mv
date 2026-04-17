# Product Requirements Document: boutique-mv

**Date:** 2026-03-04
**Author:** ADMIN
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 3
**Status:** Draft

---

## Document Overview

Ce PRD (Product Requirements Document) définit les exigences fonctionnelles et non-fonctionnelles pour le projet boutique-mv. Il sert de source de vérité pour ce qui sera construit et assure la traçabilité des exigences jusqu'à l'implémentation.

**Documents associés :**
- Product Brief: `docs/product-brief-boutique-mv-2026-03-04.md`

---

## Executive Summary

Boutique MV est une boutique e-commerce basée à Abidjan (Côte d'Ivoire) vendant des articles de mode et maison (gourdes, vêtements) en FCFA. Le site frontend existant (React/TypeScript/Vite/Tailwind) fonctionne avec des données produits hardcodées et un système de commande via WhatsApp, sans backend ni interface d'administration. Ce projet vise à créer une interface d'administration complète utilisant Clerk pour l'authentification et Convex comme Backend-as-a-Service, permettant au propriétaire de gérer dynamiquement les produits, les commandes, le contenu du site et de consulter des statistiques de vente — sans jamais toucher au code.

---

## Product Goals

### Business Objectives

- **Scalabilité** : Préparer l'infrastructure de la boutique pour supporter une croissance significative du catalogue (de 5 à des centaines de produits) et du volume de commandes
- **Autonomie opérationnelle** : Éliminer toute dépendance au code pour les opérations métier quotidiennes
- **Centralisation des données** : Regrouper produits, commandes et clients dans une base de données unique et structurée (Convex)

### Success Metrics

- **100% des commandes trackées** : Toutes les commandes (WhatsApp + formulaire) sont enregistrées et suivies dans le dashboard d'administration
- **Zéro modification de code** pour les opérations courantes (ajout/modification de produits, suivi de commandes)
- **Temps de mise à jour du catalogue** réduit de plusieurs minutes (code + deploy) à quelques secondes (interface admin)

---

## Functional Requirements

Les exigences fonctionnelles (FRs) définissent **ce que** le système fait — des fonctionnalités et comportements spécifiques.

Chaque exigence inclut :
- **ID** : Identifiant unique (FR-001, FR-002, etc.)
- **Priorité** : Must Have / Should Have / Could Have (MoSCoW)
- **Description** : Ce que le système doit faire
- **Critères d'acceptation** : Comment vérifier que c'est terminé

---

### Domaine 1 : Authentification & Sécurité

#### FR-001 : Connexion administrateur via Clerk

**Priorité :** Must Have

**Description :**
L'administrateur peut se connecter à l'interface d'administration via Clerk en utilisant un email et un mot de passe.

**Critères d'acceptation :**
- [ ] L'écran de connexion Clerk s'affiche lorsqu'on accède à `/admin`
- [ ] L'admin peut se connecter avec ses identifiants email/mot de passe
- [ ] Après connexion réussie, l'admin est redirigé vers le dashboard
- [ ] En cas d'erreur, un message clair est affiché

**Dépendances :** Aucune

---

#### FR-002 : Protection des routes admin

**Priorité :** Must Have

**Description :**
Toutes les routes de l'interface d'administration sont protégées. Un utilisateur non authentifié est automatiquement redirigé vers la page de connexion.

**Critères d'acceptation :**
- [ ] L'accès à `/admin/*` sans authentification redirige vers la page de connexion Clerk
- [ ] Après déconnexion, l'accès aux routes admin est bloqué
- [ ] Le site vitrine public reste accessible sans authentification

**Dépendances :** FR-001

---

#### FR-003 : Contrôle d'accès par rôle admin

**Priorité :** Must Have

**Description :**
Seul le propriétaire (rôle admin dans Clerk) peut accéder à l'interface d'administration. Les autres utilisateurs Clerk éventuels sont refusés.

**Critères d'acceptation :**
- [ ] Seuls les utilisateurs avec le rôle "admin" dans Clerk peuvent accéder à l'admin
- [ ] Un utilisateur authentifié sans rôle admin voit un message "Accès refusé"
- [ ] Les mutations Convex vérifient le rôle avant d'exécuter

**Dépendances :** FR-001, FR-002

---

### Domaine 2 : Gestion des Produits

#### FR-004 : Création de produit

**Priorité :** Must Have

**Description :**
L'admin peut créer un nouveau produit avec : nom, description, prix (en FCFA), catégorie et images.

**Critères d'acceptation :**
- [ ] Formulaire de création avec champs : nom, description, prix, catégorie, images
- [ ] Validation des champs obligatoires (nom, prix, catégorie, au moins 1 image)
- [ ] Le produit créé apparaît immédiatement dans le catalogue admin
- [ ] Le produit créé est visible sur le site vitrine (si activé)
- [ ] Confirmation visuelle après création réussie

**Dépendances :** FR-001, FR-002, FR-003

---

#### FR-005 : Modification de produit

**Priorité :** Must Have

**Description :**
L'admin peut modifier tous les champs d'un produit existant (nom, description, prix, catégorie, images).

**Critères d'acceptation :**
- [ ] Le formulaire de modification est pré-rempli avec les données actuelles
- [ ] Les modifications sont sauvegardées en temps réel dans Convex
- [ ] Les modifications sont reflétées immédiatement sur le site vitrine
- [ ] Confirmation visuelle après modification réussie

**Dépendances :** FR-004

---

#### FR-006 : Suppression de produit

**Priorité :** Must Have

**Description :**
L'admin peut supprimer un produit du catalogue.

**Critères d'acceptation :**
- [ ] Demande de confirmation avant suppression ("Êtes-vous sûr ?")
- [ ] Le produit supprimé disparaît du catalogue admin et du site vitrine
- [ ] Les commandes associées à ce produit conservent l'historique

**Dépendances :** FR-004

---

#### FR-007 : Gestion des catégories

**Priorité :** Must Have

**Description :**
L'admin peut créer, renommer et supprimer des catégories de produits.

**Critères d'acceptation :**
- [ ] L'admin peut créer une nouvelle catégorie avec un nom
- [ ] L'admin peut renommer une catégorie existante
- [ ] L'admin peut supprimer une catégorie (avec avertissement si des produits y sont associés)
- [ ] Les catégories sont utilisées comme filtres sur le site vitrine

**Dépendances :** FR-004

---

#### FR-008 : Upload d'images produit

**Priorité :** Must Have

**Description :**
L'admin peut uploader une ou plusieurs images pour chaque produit, avec prévisualisation avant sauvegarde.

**Critères d'acceptation :**
- [ ] Upload par glisser-déposer ou sélection de fichier
- [ ] Prévisualisation de l'image avant sauvegarde
- [ ] Support des formats JPG, PNG, WebP
- [ ] Taille maximale par image : 5 Mo
- [ ] Possibilité d'ajouter plusieurs images (galerie)
- [ ] Possibilité de supprimer une image existante

**Dépendances :** FR-004

---

#### FR-009 : Activation/Désactivation de produit

**Priorité :** Should Have

**Description :**
L'admin peut activer ou désactiver un produit pour le rendre visible ou masqué sur le site vitrine sans le supprimer.

**Critères d'acceptation :**
- [ ] Toggle visible/masqué sur chaque produit dans la liste admin
- [ ] Un produit désactivé n'apparaît pas sur le site vitrine
- [ ] Un produit désactivé reste visible dans l'admin (marqué comme masqué)
- [ ] L'état est persisté dans Convex

**Dépendances :** FR-004

---

#### FR-010 : Gestion du stock

**Priorité :** Should Have

**Description :**
L'admin peut définir et suivre la quantité en stock de chaque produit.

**Critères d'acceptation :**
- [ ] Champ "quantité en stock" dans le formulaire produit
- [ ] Indicateur visuel quand le stock est bas (< 5 unités)
- [ ] Le stock est décrémenté automatiquement à chaque commande
- [ ] Option de masquer automatiquement un produit quand le stock atteint 0

**Dépendances :** FR-004, FR-014

---

#### FR-011 : Réordonnancement des produits

**Priorité :** Could Have

**Description :**
L'admin peut réordonner les produits dans le catalogue par glisser-déposer pour contrôler l'ordre d'affichage sur le site.

**Critères d'acceptation :**
- [ ] Drag & drop pour réordonner les produits
- [ ] L'ordre est sauvegardé dans Convex
- [ ] Le site vitrine respecte l'ordre défini

**Dépendances :** FR-004

---

### Domaine 3 : Système de Commandes

#### FR-012 : Formulaire de commande intégré

**Priorité :** Must Have

**Description :**
Le client peut passer commande via un formulaire intégré au site vitrine avec : nom, téléphone, lieu de livraison.

**Critères d'acceptation :**
- [ ] Formulaire accessible depuis le panier
- [ ] Champs : nom complet, numéro de téléphone, adresse de livraison
- [ ] Validation des champs obligatoires
- [ ] Confirmation de commande affichée après soumission
- [ ] La commande est enregistrée dans Convex avec tous les articles du panier

**Dépendances :** FR-029

---

#### FR-013 : Commande via WhatsApp (conservé)

**Priorité :** Must Have

**Description :**
Le client peut toujours commander via WhatsApp. Le bouton "Commander sur WhatsApp" enregistre automatiquement la commande dans Convex avant d'ouvrir WhatsApp.

**Critères d'acceptation :**
- [ ] Le bouton "Commander sur WhatsApp" reste fonctionnel
- [ ] Avant d'ouvrir WhatsApp, la commande est enregistrée dans Convex
- [ ] Le message WhatsApp pré-formaté est conservé (avec détails panier)
- [ ] La commande apparaît dans le dashboard admin avec la source "WhatsApp"

**Dépendances :** FR-014

---

#### FR-014 : Centralisation des commandes dans Convex

**Priorité :** Must Have

**Description :**
Toutes les commandes (formulaire + WhatsApp) sont enregistrées dans la base de données Convex avec : articles, quantités, prix, informations client, date, source, statut.

**Critères d'acceptation :**
- [ ] Schéma de commande Convex : id, articles[], client{nom, tel, adresse}, total, source (formulaire/whatsapp), statut, date
- [ ] Les commandes formulaire et WhatsApp utilisent le même schéma
- [ ] Chaque commande a un numéro de commande unique

**Dépendances :** FR-001

---

#### FR-015 : Liste des commandes avec filtres

**Priorité :** Must Have

**Description :**
L'admin peut voir la liste de toutes les commandes avec des filtres par date, statut et source.

**Critères d'acceptation :**
- [ ] Liste paginée des commandes (les plus récentes en premier)
- [ ] Filtres : par statut, par date (période), par source (formulaire/WhatsApp)
- [ ] Chaque ligne affiche : numéro, date, client, montant, statut, source
- [ ] Recherche par nom ou téléphone du client

**Dépendances :** FR-014

---

#### FR-016 : Gestion des statuts de commande

**Priorité :** Must Have

**Description :**
L'admin peut changer le statut d'une commande : Nouvelle → En cours → Livrée / Annulée.

**Critères d'acceptation :**
- [ ] Statuts disponibles : Nouvelle, En cours, Livrée, Annulée
- [ ] Changement de statut en un clic depuis la liste ou le détail
- [ ] Code couleur pour chaque statut
- [ ] Horodatage de chaque changement de statut

**Dépendances :** FR-015

---

#### FR-017 : Détail d'une commande

**Priorité :** Must Have

**Description :**
L'admin peut voir le détail complet d'une commande : liste des produits commandés, quantités, prix unitaires, total, informations client.

**Critères d'acceptation :**
- [ ] Vue détaillée accessible depuis la liste des commandes
- [ ] Affiche : produits avec images, quantités, prix unitaires, sous-total par ligne
- [ ] Affiche : informations client (nom, téléphone, adresse)
- [ ] Affiche : total, date, source, historique des statuts

**Dépendances :** FR-015

---

#### FR-018 : Notification de nouvelle commande

**Priorité :** Should Have

**Description :**
Le système notifie l'admin d'une nouvelle commande via une notification in-app dans l'interface d'administration.

**Critères d'acceptation :**
- [ ] Badge/compteur de nouvelles commandes sur l'icône commandes dans la navigation admin
- [ ] Notification visuelle quand une nouvelle commande arrive (si l'admin est connecté)
- [ ] Le compteur se réinitialise quand l'admin consulte les nouvelles commandes

**Dépendances :** FR-014

---

#### FR-019 : Export des commandes en CSV

**Priorité :** Could Have

**Description :**
L'admin peut exporter la liste des commandes au format CSV pour une analyse externe (Excel, Google Sheets).

**Critères d'acceptation :**
- [ ] Bouton "Exporter CSV" dans la page des commandes
- [ ] Le fichier contient : date, numéro, client, articles, montant, statut, source
- [ ] Les filtres actifs s'appliquent à l'export

**Dépendances :** FR-015

---

### Domaine 4 : Gestion du Contenu du Site

#### FR-020 : Modification de la section Hero

**Priorité :** Must Have

**Description :**
L'admin peut modifier le texte et l'image de la section Hero de la page d'accueil.

**Critères d'acceptation :**
- [ ] Formulaire d'édition : titre principal, sous-titre, image de fond, texte du bouton CTA
- [ ] Prévisualisation avant sauvegarde
- [ ] Les modifications sont reflétées immédiatement sur le site vitrine
- [ ] Upload d'image pour le fond du Hero

**Dépendances :** FR-001, FR-030

---

#### FR-021 : Modification de la section Philosophie

**Priorité :** Should Have

**Description :**
L'admin peut modifier le contenu de la section "Moins, mais mieux" (Philosophie) de la page d'accueil.

**Critères d'acceptation :**
- [ ] Édition du titre de la section
- [ ] Édition des 3 piliers (titre + description pour chacun)
- [ ] Les modifications sont reflétées sur le site vitrine

**Dépendances :** FR-001, FR-030

---

#### FR-022 : Modification des informations de contact

**Priorité :** Must Have

**Description :**
L'admin peut modifier les informations de contact affichées dans le footer : téléphone, email, adresse, numéro WhatsApp.

**Critères d'acceptation :**
- [ ] Formulaire d'édition : téléphone, email, adresse physique, numéro WhatsApp
- [ ] Les modifications sont reflétées dans le footer et dans le lien WhatsApp de commande
- [ ] Validation du format email et téléphone

**Dépendances :** FR-001, FR-030

---

#### FR-023 : Modification des liens réseaux sociaux

**Priorité :** Should Have

**Description :**
L'admin peut modifier les liens vers les réseaux sociaux (Instagram, Facebook, WhatsApp) affichés dans le footer.

**Critères d'acceptation :**
- [ ] Formulaire d'édition avec champs URL pour chaque réseau social
- [ ] Les liens sont mis à jour dans le footer du site
- [ ] Validation du format URL

**Dépendances :** FR-022

---

#### FR-024 : Bannières promotionnelles

**Priorité :** Could Have

**Description :**
L'admin peut ajouter et modifier des bannières promotionnelles affichées sur le site vitrine.

**Critères d'acceptation :**
- [ ] Création d'une bannière avec : texte, couleur de fond, lien (optionnel)
- [ ] Activation/désactivation de la bannière
- [ ] Position configurable (haut de page, catalogue)

**Dépendances :** FR-030

---

### Domaine 5 : Dashboard & Statistiques

#### FR-025 : Dashboard KPIs principaux

**Priorité :** Must Have

**Description :**
L'admin voit un dashboard avec les KPIs clés : nombre total de commandes, revenus total, commandes du jour, nombre de produits.

**Critères d'acceptation :**
- [ ] Cartes KPI affichant : commandes totales, revenus total (FCFA), commandes du jour, nombre de produits actifs
- [ ] Les données sont calculées en temps réel depuis Convex
- [ ] Le dashboard est la page d'accueil de l'admin

**Dépendances :** FR-014

---

#### FR-026 : Top produits vendus

**Priorité :** Must Have

**Description :**
L'admin voit un classement des produits les plus vendus.

**Critères d'acceptation :**
- [ ] Liste/tableau des top 10 produits par volume de ventes
- [ ] Affiche : nom du produit, nombre d'unités vendues, revenu généré
- [ ] Données basées sur les commandes enregistrées

**Dépendances :** FR-025

---

#### FR-027 : Filtrage par période

**Priorité :** Should Have

**Description :**
L'admin peut filtrer les statistiques par période : aujourd'hui, cette semaine, ce mois, période personnalisée.

**Critères d'acceptation :**
- [ ] Sélecteur de période : Aujourd'hui, 7 jours, 30 jours, personnalisé
- [ ] Tous les KPIs et le top produits se mettent à jour selon la période
- [ ] La période sélectionnée est visuellement indiquée

**Dépendances :** FR-025

---

#### FR-028 : Graphique d'évolution des ventes

**Priorité :** Could Have

**Description :**
L'admin voit un graphique montrant l'évolution des ventes dans le temps.

**Critères d'acceptation :**
- [ ] Graphique linéaire ou en barres montrant les ventes par jour/semaine
- [ ] Axes : temps (x) et revenus ou nombre de commandes (y)
- [ ] Responsive sur desktop et tablette

**Dépendances :** FR-025

---

### Domaine 6 : Adaptation du Site Vitrine

#### FR-029 : Affichage dynamique des produits

**Priorité :** Must Have

**Description :**
Le site vitrine affiche les produits dynamiquement depuis Convex au lieu des données hardcodées.

**Critères d'acceptation :**
- [ ] Le catalogue charge les produits depuis Convex via une query
- [ ] Les filtres par catégorie fonctionnent avec les catégories dynamiques
- [ ] Les pages détail produit consomment les données Convex
- [ ] État de chargement (loading) affiché pendant le fetch
- [ ] Gestion d'erreur si Convex est indisponible

**Dépendances :** FR-004, FR-032

---

#### FR-030 : Affichage dynamique du contenu

**Priorité :** Must Have

**Description :**
Le site vitrine affiche le contenu éditorial (hero, philosophie, contacts) dynamiquement depuis Convex.

**Critères d'acceptation :**
- [ ] La section Hero utilise les données de Convex
- [ ] La section Philosophie utilise les données de Convex
- [ ] Le footer utilise les données de contact de Convex
- [ ] Fallback sur des valeurs par défaut si les données ne sont pas encore configurées

**Dépendances :** FR-020, FR-022

---

#### FR-031 : États de chargement et gestion d'erreurs

**Priorité :** Must Have

**Description :**
Le site vitrine gère correctement les états de chargement et les erreurs lors de la récupération des données depuis Convex.

**Critères d'acceptation :**
- [ ] Skeleton loaders pendant le chargement des produits
- [ ] Skeleton loaders pendant le chargement du contenu
- [ ] Message d'erreur user-friendly en cas de problème de connexion
- [ ] Le site ne "casse" pas si Convex est temporairement indisponible

**Dépendances :** FR-029, FR-030

---

#### FR-032 : Migration des données existantes

**Priorité :** Must Have

**Description :**
Les 5 produits actuellement hardcodés dans `App.tsx` sont migrés vers la base de données Convex.

**Critères d'acceptation :**
- [ ] Script de migration ou seed qui insère les 5 produits existants dans Convex
- [ ] Les données migrées incluent : nom, description, prix, catégorie, images (URLs Cloudinary)
- [ ] Les catégories existantes (Gourdes, Vêtements) sont créées dans Convex
- [ ] Vérification que les données migrées sont identiques aux données hardcodées
- [ ] Suppression du hardcode dans `App.tsx` après validation

**Dépendances :** Aucune

---

## Non-Functional Requirements

Les exigences non-fonctionnelles (NFRs) définissent **comment** le système performe — attributs de qualité et contraintes.

---

### NFR-001 : Performance - Interface Admin

**Priorité :** Must Have

**Description :**
Les pages de l'interface d'administration se chargent en moins de 3 secondes.

**Critères d'acceptation :**
- [ ] Temps de chargement initial < 3s (First Contentful Paint)
- [ ] Les opérations CRUD répondent en < 1s
- [ ] Les données en temps réel Convex se mettent à jour sans rechargement de page

**Justification :** Une interface admin lente découragerait l'utilisation quotidienne.

---

### NFR-002 : Performance - Site Vitrine

**Priorité :** Must Have

**Description :**
Le site vitrine se charge en moins de 2 secondes avec les données provenant de Convex.

**Critères d'acceptation :**
- [ ] First Contentful Paint < 2s sur une connexion 3G rapide
- [ ] Les images produits sont optimisées (lazy loading, formats modernes)
- [ ] Le passage de données hardcodées à Convex ne dégrade pas les performances perçues

**Justification :** Les clients en Côte d'Ivoire peuvent avoir des connexions variables ; le site doit rester rapide.

---

### NFR-003 : Sécurité - Authentification

**Priorité :** Must Have

**Description :**
L'authentification est gérée par Clerk avec des sessions sécurisées.

**Critères d'acceptation :**
- [ ] Sessions gérées par Clerk (tokens JWT)
- [ ] Expiration automatique des sessions inactives
- [ ] Protection contre les attaques CSRF
- [ ] HTTPS obligatoire pour toutes les communications

**Justification :** Protéger l'accès aux données business et clients.

---

### NFR-004 : Sécurité - Autorisation des mutations

**Priorité :** Must Have

**Description :**
Toutes les mutations Convex (création, modification, suppression) vérifient l'authentification et le rôle admin côté serveur.

**Critères d'acceptation :**
- [ ] Chaque mutation Convex vérifie le token Clerk avant exécution
- [ ] Les queries publiques (site vitrine) ne exposent pas de données sensibles
- [ ] Les mutations de création de commande sont accessibles sans authentification (pour les clients)

**Justification :** Empêcher toute modification non autorisée des données.

---

### NFR-005 : Fiabilité - Indépendance site vitrine

**Priorité :** Must Have

**Description :**
Le site vitrine reste accessible même si l'interface d'administration est hors ligne ou si l'admin n'est pas connecté.

**Critères d'acceptation :**
- [ ] Le site vitrine fonctionne indépendamment de l'état de l'admin
- [ ] Si Convex est temporairement indisponible, le site affiche un message d'erreur gracieux
- [ ] Les données en cache restent affichées pendant une interruption temporaire

**Justification :** Les clients ne doivent jamais être bloqués.

---

### NFR-006 : Usabilité - Responsive Admin

**Priorité :** Should Have

**Description :**
L'interface d'administration est utilisable sur desktop et tablette.

**Critères d'acceptation :**
- [ ] Layout responsive qui s'adapte aux écrans >= 768px
- [ ] Navigation admin fonctionnelle sur tablette
- [ ] Les formulaires sont utilisables sur écran tactile

**Justification :** Le propriétaire peut vouloir gérer la boutique depuis une tablette.

---

### NFR-007 : Usabilité - Intuitivité

**Priorité :** Must Have

**Description :**
L'interface d'administration est utilisable sans formation technique préalable.

**Critères d'acceptation :**
- [ ] Labels clairs et en français pour tous les champs et boutons
- [ ] Messages d'erreur compréhensibles (pas de jargon technique)
- [ ] Actions destructives (supprimer) nécessitent une confirmation
- [ ] Feedback visuel pour chaque action (toast notifications)

**Justification :** L'utilisateur a un niveau technique basique.

---

### NFR-008 : Compatibilité navigateurs

**Priorité :** Must Have

**Description :**
Le site (vitrine + admin) fonctionne sur les navigateurs modernes.

**Critères d'acceptation :**
- [ ] Chrome (2 dernières versions)
- [ ] Safari (2 dernières versions)
- [ ] Firefox (2 dernières versions)
- [ ] Navigateur mobile (Chrome Mobile, Safari iOS)

**Justification :** Couvrir les navigateurs utilisés en Côte d'Ivoire.

---

### NFR-009 : Maintenabilité - TypeScript strict

**Priorité :** Should Have

**Description :**
Le code est écrit en TypeScript avec typage strict pour faciliter la maintenance.

**Critères d'acceptation :**
- [ ] `strict: true` dans `tsconfig.json`
- [ ] Pas de `any` explicite sauf cas exceptionnels justifiés
- [ ] Les schémas Convex sont typés et validés
- [ ] Les types sont partagés entre le frontend et les fonctions Convex

**Justification :** Réduire les bugs et faciliter les évolutions futures.

---

## Epics

Les Epics regroupent les exigences fonctionnelles en blocs de travail logiques qui seront découpés en user stories lors du sprint planning (Phase 4).

---

### EPIC-001 : Setup & Infrastructure

**Description :**
Mise en place de l'infrastructure technique : intégration de Clerk et Convex dans le projet existant, configuration des schémas de données et migration des données hardcodées.

**Exigences fonctionnelles :**
- FR-001 : Connexion administrateur via Clerk
- FR-002 : Protection des routes admin
- FR-003 : Contrôle d'accès par rôle admin
- FR-032 : Migration des données existantes

**Estimation stories :** 4-6

**Priorité :** Must Have

**Valeur business :**
Fondation technique sur laquelle reposent toutes les autres fonctionnalités. Sans cette epic, rien d'autre ne peut être construit.

---

### EPIC-002 : Gestion des Produits

**Description :**
Interface complète de gestion du catalogue produits : création, modification, suppression, catégories, images, stock et visibilité.

**Exigences fonctionnelles :**
- FR-004 : Création de produit
- FR-005 : Modification de produit
- FR-006 : Suppression de produit
- FR-007 : Gestion des catégories
- FR-008 : Upload d'images produit
- FR-009 : Activation/Désactivation de produit
- FR-010 : Gestion du stock
- FR-011 : Réordonnancement des produits

**Estimation stories :** 6-8

**Priorité :** Must Have

**Valeur business :**
Coeur de l'autonomie opérationnelle. Permet au propriétaire de gérer son catalogue sans toucher au code.

---

### EPIC-003 : Système de Commandes

**Description :**
Système complet de commandes : formulaire client intégré, conservation de WhatsApp avec enregistrement automatique, dashboard de gestion des commandes avec statuts et filtres.

**Exigences fonctionnelles :**
- FR-012 : Formulaire de commande intégré
- FR-013 : Commande via WhatsApp (conservé)
- FR-014 : Centralisation des commandes dans Convex
- FR-015 : Liste des commandes avec filtres
- FR-016 : Gestion des statuts de commande
- FR-017 : Détail d'une commande
- FR-018 : Notification de nouvelle commande
- FR-019 : Export des commandes en CSV

**Estimation stories :** 6-8

**Priorité :** Must Have

**Valeur business :**
Résout le problème principal de traçabilité des commandes. 100% des commandes seront trackées.

---

### EPIC-004 : Gestion du Contenu

**Description :**
Interface permettant de modifier le contenu éditorial du site vitrine : section Hero, Philosophie, informations de contact, liens sociaux et bannières promotionnelles.

**Exigences fonctionnelles :**
- FR-020 : Modification de la section Hero
- FR-021 : Modification de la section Philosophie
- FR-022 : Modification des informations de contact
- FR-023 : Modification des liens réseaux sociaux
- FR-024 : Bannières promotionnelles

**Estimation stories :** 4-5

**Priorité :** Should Have

**Valeur business :**
Complète l'autonomie opérationnelle en rendant le contenu du site entièrement éditable.

---

### EPIC-005 : Dashboard & Statistiques

**Description :**
Tableau de bord analytique avec KPIs, classement des produits populaires, filtrage par période et graphiques d'évolution.

**Exigences fonctionnelles :**
- FR-025 : Dashboard KPIs principaux
- FR-026 : Top produits vendus
- FR-027 : Filtrage par période
- FR-028 : Graphique d'évolution des ventes

**Estimation stories :** 4-5

**Priorité :** Must Have

**Valeur business :**
Donne au propriétaire une visibilité sur les performances de sa boutique pour prendre des décisions éclairées.

---

### EPIC-006 : Adaptation Site Vitrine

**Description :**
Adaptation du site vitrine existant pour consommer les données dynamiquement depuis Convex au lieu des données hardcodées, avec gestion des états de chargement et d'erreur.

**Exigences fonctionnelles :**
- FR-029 : Affichage dynamique des produits
- FR-030 : Affichage dynamique du contenu
- FR-031 : États de chargement et gestion d'erreurs

**Estimation stories :** 3-4

**Priorité :** Must Have

**Valeur business :**
Rend le site vitrine dynamique et connecté au backend. Les modifications admin sont immédiatement visibles par les clients.

---

## User Stories (High-Level)

Les user stories détaillées seront créées lors du sprint planning (Phase 4). Les epics ci-dessus fournissent le cadre pour leur découpage.

---

## User Personas

### Persona 1 : Admin (Propriétaire de BMV Boutique)

- **Nom :** Propriétaire BMV
- **Rôle :** Gérant(e) et administrateur(trice) unique
- **Localisation :** Abidjan, Côte d'Ivoire
- **Niveau technique :** Basique (utilise Excel, réseaux sociaux)
- **Objectifs :** Gérer le catalogue, suivre les commandes, adapter le contenu du site
- **Frustrations :** Devoir modifier du code pour des opérations simples, pas de visibilité sur les ventes
- **Fréquence d'utilisation :** Quotidienne

### Persona 2 : Client de la boutique

- **Rôle :** Acheteur
- **Localisation :** Côte d'Ivoire (principalement Abidjan)
- **Niveau technique :** Variable (familier avec WhatsApp et navigation web mobile)
- **Objectifs :** Parcourir le catalogue, passer commande facilement
- **Canal préféré :** WhatsApp ou formulaire en ligne

---

## User Flows

### Flow 1 : Admin - Ajouter un produit

1. Se connecter à l'admin via Clerk
2. Naviguer vers "Produits" → "Nouveau produit"
3. Remplir le formulaire (nom, description, prix, catégorie)
4. Uploader les images
5. Sauvegarder → Le produit apparaît immédiatement sur le site vitrine

### Flow 2 : Client - Passer commande via formulaire

1. Parcourir le catalogue sur le site vitrine
2. Ajouter des produits au panier
3. Ouvrir le panier → Remplir le formulaire (nom, téléphone, adresse)
4. Soumettre la commande
5. Voir la confirmation → La commande apparaît dans le dashboard admin

### Flow 3 : Admin - Gérer une commande

1. Voir la notification de nouvelle commande sur le dashboard
2. Ouvrir le détail de la commande
3. Vérifier les articles et les informations client
4. Changer le statut de "Nouvelle" à "En cours"
5. Après livraison, changer le statut à "Livrée"

---

## Dependencies

### Internal Dependencies

- **Code existant** : Le site vitrine React/TypeScript/Vite/Tailwind existant doit être adapté (pas réécrit)
- **Données hardcodées** : Les 5 produits dans `App.tsx` et les données de contenu doivent être migrés
- **Images Cloudinary** : Les URLs Cloudinary existantes doivent rester fonctionnelles

### External Dependencies

- **Clerk** : Service d'authentification SaaS (plan gratuit)
- **Convex** : Backend-as-a-Service pour le stockage et les fonctions serveur (plan gratuit)
- **Cloudinary** : Hébergement des images produits (existant)
- **Hostinger** : Hébergement du site statique React (déploiement cible)
- **WhatsApp API** : Lien wa.me pour les commandes WhatsApp (existant, pas d'API officielle)

---

## Assumptions

- Les plans gratuits de Clerk et Convex seront suffisants pour le volume actuel et à court terme
- Hostinger peut servir une application React SPA avec appels vers Convex (backend serverless externe)
- Les images produits continueront d'être hébergées sur Cloudinary (ou migrées vers Convex Storage)
- Le numéro WhatsApp existant (+225 07 67 72 93 96) reste le canal de communication principal
- Un seul administrateur suffit (pas de gestion multi-utilisateurs admin)
- Le volume de données restera dans les limites du free tier Convex pendant au moins 12 mois

---

## Out of Scope

- Paiement en ligne (Mobile Money, carte bancaire, etc.)
- Gestion multi-boutique / multi-marque
- Application mobile native pour l'administration
- Programme de fidélité client
- Support multi-langue
- Intégration de services de livraison tiers
- Système de notifications push ou email aux clients
- Compte client avec historique de commandes côté client
- SEO avancé / blog intégré

---

## Open Questions

Aucune question ouverte pour le moment. Toutes les exigences ont été validées avec le propriétaire.

---

## Approval & Sign-off

### Stakeholders

- **ADMIN (Propriétaire & Développeur)** - Décideur unique

### Approval Status

- [ ] Product Owner (ADMIN)

---

## Revision History

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0 | 2026-03-04 | ADMIN | PRD initial |

---

## Next Steps

### Phase 3 : Architecture

Lancer `/bmad:architecture` pour concevoir l'architecture système basée sur ces exigences.

L'architecture couvrira :
- Toutes les exigences fonctionnelles (FRs)
- Toutes les exigences non-fonctionnelles (NFRs)
- Décisions techniques (Clerk + Convex)
- Modèles de données et schémas Convex
- Composants système et leur interaction

### Phase 4 : Sprint Planning

Après l'architecture, lancer `/bmad:sprint-planning` pour :
- Découper les epics en user stories détaillées
- Estimer la complexité des stories
- Planifier les sprints
- Commencer l'implémentation

---

**Ce document a été créé avec BMAD Method v6 - Phase 2 (Planning)**

*Pour continuer : Lancez `/bmad:workflow-status` pour voir votre progression et la prochaine étape recommandée.*

---

## Annexe A : Matrice de Traçabilité

| Epic ID | Nom de l'Epic | Exigences Fonctionnelles | Stories (Est.) |
|---------|---------------|--------------------------|----------------|
| EPIC-001 | Setup & Infrastructure | FR-001, FR-002, FR-003, FR-032 | 4-6 |
| EPIC-002 | Gestion des Produits | FR-004 à FR-011 | 6-8 |
| EPIC-003 | Système de Commandes | FR-012 à FR-019 | 6-8 |
| EPIC-004 | Gestion du Contenu | FR-020 à FR-024 | 4-5 |
| EPIC-005 | Dashboard & Statistiques | FR-025 à FR-028 | 4-5 |
| EPIC-006 | Adaptation Site Vitrine | FR-029 à FR-031 | 3-4 |
| **TOTAL** | | **32 FRs** | **27-36 stories** |

---

## Annexe B : Détails de Priorisation

### Résumé MoSCoW

**Exigences fonctionnelles (32 FRs) :**
| Priorité | Nombre | Pourcentage |
|----------|--------|-------------|
| Must Have | 22 | 69% |
| Should Have | 7 | 22% |
| Could Have | 3 | 9% |

**Exigences non-fonctionnelles (9 NFRs) :**
| Priorité | Nombre | Pourcentage |
|----------|--------|-------------|
| Must Have | 7 | 78% |
| Should Have | 2 | 22% |

### Must Have FRs (MVP)
FR-001 à FR-008, FR-012 à FR-017, FR-020, FR-022, FR-025, FR-026, FR-029 à FR-032

### Should Have FRs
FR-009, FR-010, FR-018, FR-021, FR-023, FR-027, NFR-006, NFR-009

### Could Have FRs
FR-011, FR-019, FR-024, FR-028
