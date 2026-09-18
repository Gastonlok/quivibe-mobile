# Quivibe mobile — analyse préalable

Analyse du 18 septembre 2026. Aucun code applicatif ni backend modifié.

## Périmètre et preuves

- Mobile : `C:/dev/quivibe-mobile-starter`, application Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript. `src/services/places.ts` retourne des données fictives ; `src/hooks/useFavorites.ts` conserve des identifiants dans AsyncStorage. Pas encore de connexion au backend, Expo Router, TanStack Query, SecureStore, Expo Image ou Location.
- Web trouvé dans `C:/dev/Quivibe-newApp-final/apps/web`. Analyse de cette copie locale, qui comporte des modifications préexistantes. Sa correspondance exacte avec le déploiement Vercel n'est pas établie. Le site public n'a pas pu être chargé avec l'outil de consultation web.
- Web : Next.js 15, React 19, Prisma 5, PostgreSQL, Auth.js 5 beta, Tailwind 3, Zod, React Hook Form et TanStack Query. Cloudinary et Resend sont intégrés côté serveur.
- Documentation consultée : https://docs.expo.dev/versions/v57.0.0/.

## Réutilisation par parcours

| Parcours | Source existante dans apps/web | Adaptation mobile |
| --- | --- | --- |
| Catalogue, recherche, suggestions | `features/places/search-actions.ts`, `search-service.ts`, `search-params.ts`, `actions.ts` | Exposer des routes HTTP publiques paginées, avec champs de réponse explicitement sélectionnés. |
| Fiche, galerie, catégories, menu | `getPlaceBySlug` dans `features/places/actions.ts` | Route de détail ; respecter APPROVED et menuVisible. Ne pas exposer les informations privées du propriétaire. |
| Favoris | `features/favorites/actions.ts` | Routes authentifiées de lecture et ajout/retrait ; même table Favorite. Préférer des mutations idempotentes pour les reprises réseau. |
| Réservations | `features/reservations/actions.ts`, `service.ts`, `availability.ts`, `domain.ts`, `pricing.ts` | Adaptateurs HTTP appelant les services existants ; préserver transactions, capacité, fuseau Kinshasa, prix serveur, requestKey, annulation, notifications et invalidation web. |
| Événements | `app/events/page.tsx`, `app/events/[id]/page.tsx` | Extraire les lectures Prisma dans un service commun et exposer liste paginée/détail publics. Les routes admin ne remplacent pas une API publique. |
| Avis | `POST /api/reviews`, `POST /api/reviews/[reviewId]/report` | Écriture existante avec session ; ajouter lecture paginée et mes avis. Un avis par compte/lieu, publication après modération. |
| Profil | `PATCH /api/profile`, `PATCH /api/profile/password`, `POST /api/uploads/avatar` | Réutiliser après adaptation de session ; ajouter lecture du profil si nécessaire. Avatar : signature Cloudinary fournie par le serveur. |
| Authentification | `lib/auth.ts`, `/api/auth/[...nextauth]`, `POST /api/auth/register`, `GET /api/auth/verify-email`, `POST /api/auth/request-password-reset`, `POST /api/auth/reset-password` | Définir le transport de session natif et les liens de retour ; conserver les mêmes comptes et contrôles serveur. |
| Quivibe AI | `POST /api/quivibe-ai`, `features/ai/*` | Réutiliser query/history/context/previousIds/position et la réponse message/context/recommendations. Le serveur consulte les vrais lieux et utilise un modèle si configuré, avec repli métier. |

Autres routes présentes : messages, newsletter, contact propriétaires, visites/interactions, administration et tâches planifiées. Les droits actuels restent applicables ; leur présence ne signifie pas qu'elles doivent être exposées dans le mobile.

## Modèles Prisma utiles

- `User`, `Account`, `Session`, `VerificationToken` : identité. Attention : Auth.js utilise effectivement une stratégie JWT (30 jours), malgré la présence du modèle Session. Credentials, bcrypt, vérification email et suspension sont déjà contrôlés.
- `Place`, `Category`, `PlaceCategory`, `Media`, `MenuItem` : catalogue, coordonnées, médias ordonnés, menu et paramètres de réservation.
- `Favorite` : clé composée userId/placeId pour synchroniser web et mobile.
- `Review`, `OwnerReviewResponse`, `ReviewReport` : avis et modération.
- `Reservation`, `ReservationDay`, `ReservationStatusEvent`, `ReservationWaitlist` : réservation, fermeture/créneaux, historique et attente.
- `Event` : dates, description, organisateur, lieu et médias.

Aucune nouvelle base, aucun Prisma côté mobile. Les types de réponse publics doivent rester distincts des modèles internes.

## Écarts à traiter

La recherche serveur dispose déjà des catégories, quartiers, prix, note minimale, équipements, proximité, tri, pagination et disponibilités date/heure/personnes. Elle retourne une page de détails, mais charge des candidats et agrégats pour les filtrages : mesurer cette partie avant une montée en charge.

Le schéma ne distingue pas une commune d'un quartier. Il ne définit pas des horaires d'ouverture hebdomadaires, des liens sociaux structurés ni un tarif d'événement. Les horaires de réservation ne prouvent pas qu'un lieu est ouvert. Les vibes demandées doivent être rapprochées des catégories/équipements et des critères AI existants avant tout ajout de champs. Ne pas inventer ces valeurs dans l'interface.

Auth.js fournit actuellement une session web ; aucun contrat de jeton Bearer natif n'a été trouvé dans les fichiers inspectés. SecureStore est un stockage, pas une solution d'authentification à lui seul. Il faut définir et tester connexion, persistance, expiration, déconnexion et résolution du même User côté serveur. Ne pas supposer que les cookies du navigateur sont partagés avec React Native.

## Identité et architecture proposées

Le thème web fournit orange `#f99216`, noir `#0e0f0c` et blanc. Les cartes comportent photographie, note nullable, catégorie, prix sur quatre niveaux, quartier et favori. Reprendre ces codes dans des composants React Native ; les composants Next/Image, Tailwind, Leaflet et Server Actions ne sont pas directement importables.

Le dossier actuel peut rester l'application mobile séparée ; inutile de créer un second projet Expo imbriqué. Introduire Expo Router avec cinq onglets et les parcours stack, puis services/api, hooks TanStack Query, composants natifs et types publics. Le serveur reste dans le projet web.

## Suite par phases

1. Valider cette analyse et la copie web de référence.
2. Installer/configurer les dépendances mobiles et la navigation native.
3. Définir les contrats HTTP et la session mobile, puis adapter le backend existant sans dupliquer ses services.
4. Construire les parcours dans l'ordre du brief, avec TypeScript et contrôles de non-régression à chaque étape.
5. Recetter sur Android/iOS : comptes communs, favoris synchronisés, concurrence de réservation, expiration de session, permissions et réseau dégradé.

Cette analyse ne constitue pas une validation du fonctionnement en production ni une application mobile terminée.
