# Quivibe mobile

Application native Expo 57 / React Native / TypeScript. Étape actuelle : socle, navigation Expo Router et thème Quivibe (phases 2–3).

## Démarrer

Avec Node.js 22.13 minimum : `npm ci`, puis `npm start`. Utiliser Expo Go compatible SDK 57 ou un development build. Le simulateur iOS nécessite macOS/Xcode.

- `npm run web` : aperçu navigateur.
- `npm run android` / `npm run ios` : appareil ou simulateur configuré.
- `npm run type-check` : vérification TypeScript.
- `npm run export` : bundles Android, iOS et web (pas un APK/IPA).

## Disponible

Cinq onglets : Accueil, Explorer, Événements, Favoris, Profil. Routes secondaires : recherche, lieu, menu, réservation, événement, avis, connexion, inscription, compte et Quivibe AI. Thème orange/noir/blanc et logo du site, catégories navigables, pages inconnues et erreurs de rendu gérées.

TanStack Query est fourni à la racine, Expo Image affiche le logo. SecureStore, Location, React Hook Form et Zod sont installés pour les prochaines phases.

## Limites

Les parcours métier affichent explicitement leur indisponibilité. Catalogue réel, session, formulaires, favoris synchronisés, réservations, avis, événements et AI restent à raccorder. Aucune requête métier ni demande de localisation au lancement.

Les lieux fictifs et favoris de démonstration ont été retirés du code. Les anciennes données AsyncStorage ne sont plus lues ; elles ne sont pas des favoris serveur.

## Structure

- `src/app/` : routes Expo Router, onglets et stack.
- `src/components/ui.tsx` : composants natifs partagés.
- `src/constants/` : libellés de navigation.
- `src/theme.ts` : palette Quivibe.
- `assets/quivibe-logo.png` : logo existant du web.

Ce dossier est déjà l’application séparée. Aucun Prisma, secret serveur ou accès PostgreSQL côté mobile. Identifiants de distribution, icône finale adaptée aux stores et recette sur téléphones restent à préparer.

Voir [l’analyse](docs/ANALYSE-MOBILE.md), [l’intégration](docs/INTEGRATION.md) et [la validation](docs/VALIDATION.md).