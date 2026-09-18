# Raccordement au backend Quivibe

Le projet web de référence, confirmé par l’utilisateur, est `C:/dev/Quivibe-newApp-final/apps/web`. Voir ANALYSE-MOBILE.md pour les sources et modèles inspectés.

Les phases 2–3 installent la navigation native dans src/app et le thème. Aucun endpoint métier n’est encore appelé. Les anciens fichiers src/services/places.ts, src/data/places.ts et src/hooks/useFavorites.ts ont été supprimés : les données de démonstration ne représentent pas le catalogue réel.

## Phase suivante

1. Définir les contrats HTTP publics paginés et authentifiés, avec DTO explicites. Les routes catalogue, détail, favoris et réservations doivent utiliser les services existants, pas créer une deuxième logique métier.
2. Définir le transport de session natif compatible avec Auth.js et les comptes existants. SecureStore conserve les informations sensibles sur Android/iOS ; AsyncStorage ne doit pas contenir de session.
3. Créer services/api/client.ts puis venues, events, users, favorites, reservations, reviews, search et ai. Les composants utiliseront des hooks TanStack Query.
4. Préserver transactions et idempotence de réservation, notifications serveur, modération des avis, publication des lieux et visibilité des menus.
5. Brancher les écrans progressivement. Les libellés de catégories affichés actuellement sont des entrées de navigation, pas des slugs API validés.

Le mobile utilisera une URL publique de backend. Aucun secret, DATABASE_URL, Prisma ou clé privée dans une variable EXPO_PUBLIC. Le téléphone ne doit pas utiliser localhost pour joindre le PC. Prévoir l’origine CORS pour l’aperçu navigateur si nécessaire.

Les autorisations de localisation ne seront demandées qu’au clic d’une action de proximité. Le texte de permission iOS est préparé ; aucune collecte actuelle.

Aucun changement de backend ni déploiement effectué pendant les phases 2–3.