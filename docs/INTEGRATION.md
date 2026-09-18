# Raccordement au backend Quivibe

Projet de référence : `C:/dev/Quivibe-newApp-final/apps/web`, confirmé par le propriétaire. Les adaptateurs mobile vivent dans ce même serveur Next.js et utilisent son client Prisma et sa base PostgreSQL.

## Architecture réutilisée

- Recherche : `features/places/search-service.ts`, schéma et options existants.
- Fiche et menu : `getPlaceBySlug`, visibilité et approbation existantes.
- Réservation : `getAvailableSlotsAction`, `createReservationAction`, `cancelMyReservationAction`. Le service existant reste responsable des transactions, capacités, prix, idempotence, statuts et notifications.
- Avis, inscription, profil, avatar, messages, mot de passe oublié et AI : routes existantes appelées dans le contexte mobile.
- Favoris : même table Favorite, ajout idempotent et suppression limitée au compte.
- Authentification : vérification Credentials Auth.js extraite sans modification de ses règles. Aucun nouveau compte ou mot de passe parallèle.

## Session native

`POST /api/mobile/session` reçoit les identifiants existants et émet un jeton opaque aléatoire de 256 bits. Seul son SHA-256 préfixé `mobile:` est stocké dans la table Session existante, avec expiration à 30 jours. Aucune migration Prisma.

Le mobile envoie `Authorization: Bearer …`. Chaque appel vérifie l’existence du compte, la suspension et l’expiration. Déconnexion et changement/réinitialisation du mot de passe révoquent les sessions mobiles concernées.

AsyncLocalStorage fournit l’identité aux fonctions métier uniquement pendant la requête mobile. Les cookies et le parcours Auth.js web restent inchangés. SecureStore garde le jeton sur Android/iOS ; aucun jeton dans AsyncStorage. L’aperçu navigateur ne persiste pas la session.

La limitation des tentatives de connexion est bornée par IP et email, en mémoire par instance. Pour une production multi-instance, configurer une limite partagée au niveau de l’hébergement/WAF.

## Contrat HTTP

Préfixe : `/api/mobile/`. Réponses privées non mises en cache. Erreurs : `{ error, code? }`, statuts HTTP ; validation de réponse Zod côté client.

| Ressource | Méthode | Accès / usage |
| --- | --- | --- |
| session | GET / POST / DELETE | Vérification / connexion / révocation |
| register, password-reset | POST | Services de compte existants |
| search-options, suggestions?q= | GET | Catégories/quartiers et suggestions |
| venues | GET | Filtres existants, 12 lieux par page |
| venues/:slug | GET | DTO public du lieu, menu visible |
| venues/:placeId/availability | GET | date AAAA-MM-JJ, partySize ; créneaux et devis |
| events, events/:id | GET | Événements approuvés ; from/to ISO et page |
| favorites, favorites/:placeId | GET / PUT / DELETE | Compte connecté, pagination et mutations idempotentes |
| reservations | GET / POST | Liste privée ou création avec requestKey UUID et devis attendu |
| reservations/:reference | GET | Réservation appartenant au compte |
| reservations/:id | DELETE | Annulation par le service existant |
| reviews/:placeId, reviews/mine | GET | Avis publics ou avis du compte |
| reviews | POST | Avis soumis à la modération existante |
| profile | PATCH | Profil partagé |
| avatar | POST | Signature Cloudinary existante ; pas encore de sélecteur de photo mobile |
| messages | GET / PATCH | Boîte de messages du compte ; marquer comme lu |
| ai | POST | query, history (12 max), context, previousIds, position facultative |

Les listes renvoient `{items,page,total,totalPages}` ; le catalogue utilise `places` à la place de `items`. La boîte de messages conserve son contrat existant `{messages,total,unread}`, 30 messages/page. Les réservations acceptent `group=upcoming|past|cancelled`.

Le prix affiché et les créneaux viennent du serveur. Une clé UUID reste identique pour une nouvelle tentative tant que les choix du formulaire n’ont pas changé. La confirmation relit la réservation serveur et distingue CONFIRMED de PENDING.

## Configuration et livraison

Le patch de neuf fichiers est dans [backend-patches](../backend-patches/README.md). Il est déjà appliqué localement ; ne pas le réappliquer sur ce même dossier.

1. Rétablir l’accès PostgreSQL du backend : le diagnostic local du 18 septembre 2026 indique un serveur inaccessible, avec configuration présente.
2. Déployer les adaptations dans le projet web existant, avec ses variables serveur habituelles.
3. Pour l’aperçu web uniquement, définir côté serveur `MOBILE_WEB_ORIGINS=http://localhost:8081` ou les origines exactes nécessaires, séparées par des virgules.
4. Configurer `EXPO_PUBLIC_API_URL` dans le mobile et reconstruire les bundles.
5. Effectuer une recette avec un compte de test et un établissement de test : connexion, favoris, avis modéré, réservation, annulation et synchronisation web/mobile.

Les secrets PostgreSQL, Auth.js, Resend, Cloudinary et AI restent exclusivement sur le serveur.

## Cartes et données manquantes

iOS utilise Apple Maps ; Android utilise Google Maps. Expo Go fournit la configuration de carte. Pour une compilation Android indépendante, `GOOGLE_MAPS_ANDROID_API_KEY` alimente le plugin react-native-maps ; restreindre la clé au package et au certificat de signature. Sans configuration Android, un accès à l’itinéraire remplace la carte embarquée. [Documentation Expo 57](https://docs.expo.dev/versions/v57.0.0/sdk/map-view/).

Le modèle actuel ne fournit pas d’horaires hebdomadaires, de tarif d’événement ou de catégorie indépendante d’événement. L’app ne fabrique ni « ouvert maintenant » ni prix gratuit. La proximité utilise la position uniquement sur demande ; aucun suivi en arrière-plan. Les notifications affichent les messages existants, sans push natif.

Les images Cloudinary publiques sont redimensionnées à la demande. Le catalogue est paginé ; le calcul et les règles de classement restent dans le service web existant.
