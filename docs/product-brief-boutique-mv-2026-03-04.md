# Product Brief: boutique-mv

**Date:** 2026-03-04
**Author:** ADMIN
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 3

---

## Executive Summary

Boutique MV est une boutique e-commerce basée à Abidjan (Côte d'Ivoire) vendant des articles de mode et maison (gourdes, vêtements) en FCFA. Le site frontend existant (React/TypeScript/Vite/Tailwind) fonctionne avec des données produits hardcodées et un système de commande via WhatsApp, sans backend ni interface d'administration. Ce projet vise à créer une interface d'administration complète utilisant Clerk pour l'authentification et Convex comme Backend-as-a-Service, permettant au propriétaire de gérer dynamiquement les produits, les commandes, le contenu du site et de consulter des statistiques de vente — sans jamais toucher au code.

---

## Problem Statement

### The Problem

La boutique BMV souffre de plusieurs problèmes liés à l'absence de backend et d'interface d'administration :

1. **Gestion des produits manuelle** : Chaque ajout, modification ou suppression de produit nécessite de modifier le code source (données hardcodées dans `App.tsx`) et de redéployer le site. Cela crée une dépendance technique pour des opérations métier courantes.

2. **Aucun suivi des commandes** : Les commandes arrivent via WhatsApp sans traçabilité centralisée. Il est impossible de suivre l'historique, les statuts ou les volumes de commandes.

3. **Pas de gestion du contenu** : Modifier les textes, images hero ou sections du site vitrine nécessite une intervention dans le code.

4. **Aucune base de données clients** : Pas d'historique d'achats, pas de connaissance client, pas de possibilité de fidélisation.

5. **Aucune visibilité sur les performances** : Pas de statistiques de ventes, pas de métriques sur les produits populaires, aucun tableau de bord analytique.

### Why Now?

Le propriétaire souhaite professionnaliser la gestion de sa boutique. Avec un catalogue qui s'étoffe et une activité qui se développe, la gestion artisanale actuelle (code + WhatsApp) n'est plus viable pour accompagner la croissance de l'entreprise.

### Impact if Unsolved

- Temps perdu à chaque mise à jour du catalogue (modification code + redéploiement)
- Commandes perdues ou mal suivies via WhatsApp
- Impossibilité de scaler l'activité au-delà d'un petit volume
- Aucune donnée exploitable pour prendre des décisions business éclairées
- Image non professionnelle face à la concurrence

---

## Target Audience

### Primary Users

**Propriétaire de BMV Boutique (utilisateur unique)**
- Rôle : Gérant(e) et administrateur(trice) de la boutique
- Localisation : Abidjan, Côte d'Ivoire
- Niveau technique : Basique (utilise Excel, réseaux sociaux, mais pas de code)
- Besoin : Interface intuitive et simple pour gérer tous les aspects de la boutique sans compétences techniques
- Fréquence d'utilisation : Quotidienne

### Secondary Users

- **Clients de la boutique** : Utilisateurs finaux du site vitrine qui bénéficieront d'un catalogue dynamique et d'un formulaire de commande intégré (en plus de WhatsApp)

### User Needs

1. **Autonomie** : Pouvoir ajouter, modifier et supprimer des produits sans intervention technique
2. **Visibilité** : Avoir une vue centralisée de toutes les commandes et de leurs statuts
3. **Simplicité** : Interface d'administration intuitive adaptée à un utilisateur non technique

---

## Solution Overview

### Proposed Solution

Développer une interface d'administration web intégrée au site existant, avec :
- **Clerk** pour l'authentification sécurisée de l'administrateur
- **Convex** comme Backend-as-a-Service pour stocker et gérer dynamiquement les données (produits, commandes, contenu, clients)
- Migration des données hardcodées vers la base de données Convex
- Double canal de commande : WhatsApp (conservé) + formulaire intégré au site

### Key Features

- **CRUD Produits** : Ajouter, modifier, supprimer des produits (nom, prix, description, images, catégories) via une interface visuelle
- **Tableau de bord des commandes** : Visualiser et gérer toutes les commandes (WhatsApp + formulaire) avec statuts, détails client et historique
- **Gestion du contenu du site** : Modifier les textes, images hero, sections et bannières du site vitrine sans toucher au code
- **Dashboard de statistiques** : Métriques de ventes, produits populaires, tendances, revenus
- **Double canal de commande** : Conserver WhatsApp + ajouter un formulaire de commande intégré, toutes les commandes centralisées dans Convex
- **Authentification sécurisée** : Accès admin protégé par Clerk

### Value Proposition

Transformer une boutique e-commerce statique en une plateforme dynamique et professionnelle, entièrement gérable sans compétences techniques, prête à scaler avec la croissance de l'entreprise.

---

## Business Objectives

### Goals

- **Scalabilité** : Préparer l'infrastructure de la boutique pour supporter une croissance significative du catalogue (de 5 à des centaines de produits) et du volume de commandes
- **Autonomie opérationnelle** : Éliminer toute dépendance au code pour les opérations métier quotidiennes
- **Centralisation des données** : Regrouper produits, commandes et clients dans une base de données unique et structurée

### Success Metrics

- **100% des commandes trackées** : Toutes les commandes (WhatsApp + formulaire) sont enregistrées et suivies dans le dashboard d'administration
- **Zéro modification de code** pour les opérations courantes (ajout/modification de produits, suivi de commandes)
- **Temps de mise à jour du catalogue** réduit de plusieurs minutes (code + deploy) à quelques secondes (interface admin)

### Business Value

- Gain de temps significatif sur la gestion quotidienne
- Meilleure expérience client grâce à un catalogue toujours à jour
- Données exploitables pour orienter les décisions commerciales (produits populaires, tendances)
- Fondation technique solide pour les futures évolutions (paiement en ligne, livraison intégrée)

---

## Scope

### In Scope

- Intégration de **Clerk** pour l'authentification administrateur
- Intégration de **Convex** comme BaaS (schémas, mutations, queries)
- Migration des données produits hardcodées vers Convex
- Interface d'administration avec :
  - CRUD complet des produits (nom, prix, description, images, catégories, stock)
  - Tableau de bord des commandes avec statuts
  - Gestion du contenu du site vitrine (textes, images, sections)
  - Dashboard de statistiques et métriques
- Formulaire de commande intégré au site (en plus de WhatsApp)
- Enregistrement de toutes les commandes (WhatsApp + formulaire) dans Convex
- Adaptation du site vitrine pour consommer les données depuis Convex au lieu du hardcode
- Déploiement sur Hostinger

### Out of Scope

- Paiement en ligne (Mobile Money, carte bancaire, etc.)
- Gestion multi-boutique / multi-marque
- Application mobile native pour l'administration
- Programme de fidélité client
- Support multi-langue
- Intégration de services de livraison tiers

### Future Considerations

- **Suivi de livraison intégré** : Intégration avec des services de livraison locaux pour un suivi en temps réel des colis

---

## Key Stakeholders

- **ADMIN (Propriétaire & Développeur)** - Influence : Haute. Décideur unique, responsable du développement, de la gestion et de l'exploitation de la boutique. Cumule les rôles de product owner, développeur et utilisateur final de l'administration.

---

## Constraints and Assumptions

### Constraints

- **Budget** : Plans gratuits (free tier) uniquement pour Clerk et Convex
  - Clerk Free : jusqu'à 10 000 utilisateurs actifs mensuels
  - Convex Free : limites sur le stockage et les appels de fonctions
- **Hébergement** : Déploiement sur Hostinger (à valider la compatibilité avec Convex)
- **Stack technique** : Doit s'intégrer au projet React/TypeScript/Vite existant
- **Équipe** : Développeur unique (le propriétaire lui-même)
- **Utilisateur non technique** : L'interface admin doit être suffisamment intuitive pour un utilisateur avec un niveau technique basique

### Assumptions

- Les plans gratuits de Clerk et Convex seront suffisants pour le volume actuel et à court terme de la boutique
- Hostinger supporte le déploiement d'une application React avec des appels vers Convex (backend serverless externe)
- Les images produits continueront d'être hébergées sur Cloudinary
- Le numéro WhatsApp existant (+225 07 67 72 93 96) reste le canal de communication principal
- L'upload d'images produits passera par Convex Storage ou Cloudinary

---

## Success Criteria

- Toutes les commandes (WhatsApp + formulaire) sont centralisées et traçables dans le dashboard admin
- Le propriétaire peut ajouter un nouveau produit au catalogue en moins de 2 minutes via l'interface admin
- Le site vitrine affiche les produits dynamiquement depuis Convex (plus aucune donnée hardcodée)
- L'accès à l'administration est sécurisé par Clerk (seul le propriétaire peut y accéder)
- Le dashboard affiche au minimum : nombre de commandes, revenus, produits les plus vendus
- L'interface admin est utilisable sans formation technique

---

## Timeline and Milestones

### Target Launch

1 à 2 mois pour une interface d'administration complète et fonctionnelle.

### Key Milestones

- **Semaine 1-2** : Setup Clerk + Convex, schémas de données, migration des produits hardcodés
- **Semaine 3-4** : CRUD produits dans l'admin, adaptation du site vitrine pour consommer Convex
- **Semaine 5-6** : Système de commandes (formulaire + enregistrement WhatsApp), tableau de bord commandes
- **Semaine 7-8** : Gestion du contenu du site, dashboard statistiques, tests et déploiement sur Hostinger

---

## Risks and Mitigation

- **Risk:** Complexité technique de l'intégration Clerk + Convex dans le projet existant
  - **Likelihood:** Medium
  - **Mitigation:** Suivre la documentation officielle Clerk-Convex qui couvre cette intégration. Commencer par un prototype minimal (auth + 1 CRUD) avant d'attaquer les fonctionnalités complètes.

- **Risk:** Migration des données produits hardcodées vers Convex avec erreurs ou pertes
  - **Likelihood:** Low
  - **Mitigation:** Créer un script de migration automatisé. Valider les données migrées avant de supprimer le hardcode. Garder les données hardcodées en backup pendant la transition.

- **Risk:** Limites du free tier de Convex atteintes avec la croissance
  - **Likelihood:** Low (à court terme)
  - **Mitigation:** Surveiller l'utilisation via le dashboard Convex. Prévoir un budget pour upgrader si nécessaire. L'architecture Convex permet de scaler sans refactoring.

- **Risk:** Compatibilité Hostinger avec l'architecture Convex (backend serverless externe)
  - **Likelihood:** Low
  - **Mitigation:** Convex fonctionne comme un service externe (API calls depuis le frontend). Le site sur Hostinger n'a besoin que de servir les fichiers statiques React. Tester le déploiement tôt dans le projet.

---

## Next Steps

1. Create Product Requirements Document (PRD) - `/bmad:prd`
2. Create System Architecture - `/bmad:architecture`
3. Create UX design (if UI-heavy) - `/bmad:create-ux-design`

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

*To continue: Run `/bmad:workflow-status` to see your progress and next recommended workflow.*
