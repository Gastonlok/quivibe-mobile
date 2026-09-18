# Quivibe mobile

Client natif Expo SDK 57 / React Native / TypeScript pour le backend Quivibe existant. Ce dépôt ne contient ni base de données ni serveur métier indépendant.

## Parcours implémentés

- Splash et onboarding en trois étapes ; préférences mémorisées, localisation facultative.
- Accueil personnalisé, catalogue paginé, recherche, suggestions, historique et filtres.
- Fiches de lieux, photos, carte, itinéraire, téléphone, partage, menus et avis.
- Compte Quivibe partagé : connexion, inscription, réinitialisation du mot de passe, profil, favoris et messages.
- Réservation sur les créneaux du backend, contrôle du prix, reprise idempotente, confirmation et annulation.
- Événements par période et conversation Quivibe AI avec cartes de recommandations.

La découverte reste accessible sans compte. Typographie Noto Sans embarquée, inspirée de la famille utilisée sur jw.org : voir [les références](docs/TYPOGRAPHIE.md).

## Démarrer

Node.js 22.13 minimum :

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Configurer `EXPO_PUBLIC_API_URL` avec l’URL du **backend existant ayant les routes /api/mobile**. Ces routes sont déployées sur `https://quivibe.vercel.app`. Le [patch backend](backend-patches/mobile-api.patch) est conservé comme référence ; le code livré se trouve dans `Gastonlok/Quivibe-newApp`, commit `44140a7`.

Sur un téléphone, utiliser l’adresse réseau du PC ou une URL HTTPS accessible, jamais `localhost` pour joindre le PC. L’aperçu web nécessite une origine CORS autorisée côté serveur.

```powershell
npm run type-check
npm run lint
npm run export
```

L’export produit les bundles Android/iOS/web, pas un APK ni un IPA. Expo Go doit être compatible SDK 57 ; un simulateur iOS nécessite macOS/Xcode.

## Architecture

- `src/app` : Expo Router, cinq onglets et écrans secondaires.
- `src/components` : composants natifs, formulaires et cartes.
- `src/services/api` : client HTTP et contrats Zod.
- `src/hooks` : cache et pagination TanStack Query.
- `src/store` : session SecureStore native, préférences AsyncStorage.
- `src/types`, `src/utils`, `src/typography.ts` : contrats et éléments partagés.

Aucun secret serveur dans l’application. Sur web, la session reste uniquement en mémoire ; sur Android/iOS elle est conservée dans SecureStore. Le cache des données métier est en mémoire.

## État de livraison

Le backend est en production et ses réponses réelles sont validées avec les contrats Zod du mobile. TypeScript, ESLint, exports et recette navigateur passent. Les 35 tests PostgreSQL isolés et le parcours HTTP réel (connexion, favori, réservation, reprise, avis, annulation, déconnexion) passent également. La recette manuelle sur téléphone reste à effectuer. Voir [la validation](docs/VALIDATION.md) et [le déploiement Android](docs/DEPLOIEMENT.md).

Voir [le raccordement API](docs/INTEGRATION.md) et [l’analyse du projet existant](docs/ANALYSE-MOBILE.md).
