# Validation — application et adaptateurs mobile

18 septembre 2026.

## Vérifications réalisées

- TypeScript et ESLint mobile.
- Compatibilité des dépendances avec Expo SDK 57 : `npx expo install --check`.
- Export des bundles Android, iOS et web.
- TypeScript backend et ESLint ciblé sur les adaptations.
- Tests backend : **116 réussis, 25 ignorés**. Les suites ignorées requièrent une base de test. Les 22 nouveaux tests mobile couvrent le stockage haché, les jetons Bearer, expiration/suspension/révocation, isolation des identités, refus d’accès privé, pagination, filtres par compte, CORS, disponibilité déléguée et révocation lors d’un changement de mot de passe.
- Patch backend de neuf fichiers vérifié par application inverse à blanc.

## Recette navigateur automatisée

`docs/smoke-navigation.cjs` lance Chromium contre les bundles exportés et intercepte les appels API avec des fixtures explicitement réservées au test. Aucune écriture sur la production.

Parcours : onboarding, préférences après rechargement, recherche et filtres, lieu, menu, avis, connexion avec retour au parcours, réservation désactivée sans créneau, reprise après erreur 503 conservant la clé d’idempotence, confirmation relue, détail de réservation, événements et conversation AI avec ouverture d’un lieu.

Les scénarios erreur API avec nouvelle tentative et perte de connexion avec bandeau discret passent également.

Contrôles : Noto Sans chargée, aucune erreur JavaScript, absence de débordement horizontal de l’accueil à 360 × 800, 375 × 812, 390 × 844 et 412 × 915. Captures : `navigation-home.png` et `navigation-reservation.png` (données de test). L’accueil capturé montre volontairement un catalogue vide pour tester cet état.

```powershell
npm run export
node docs/smoke-navigation.cjs 'C:/dev/Quivibe-newApp-final/apps/web/node_modules/@playwright/test'
```

Sur un autre poste, installer Playwright et Chromium puis passer le chemin du module. Les fixtures ne constituent pas une validation PostgreSQL.

## Vérification réelle et limites

Le blocage local a été résolu en redémarrant Docker Desktop : PostgreSQL du projet écoute sur le port 5434. La production Neon était accessible.

Validation supplémentaire après mise en service :

- 35 tests PostgreSQL réussis sur des schémas temporaires, avec les 16 migrations du schéma publié.
- `scripts/test-mobile-http.cjs` dans le backend : vraie connexion HTTP, session hachée, favoris idempotents, réservation réellement enregistrée dans PostgreSQL local, seconde tentative sans doublon, contrôle d’appartenance, avis modéré, annulation et révocation de session. Serveur Next.js réel, aucune API simulée, aucun email envoyé. Schéma temporaire supprimé après le test.
- Déploiement Vercel construit et promu ; API publique contrôlée en lecture seule via `node docs/check-live-api.cjs`. Contrats Zod valides : 20 lieux, pages de 12, 6 catégories, 7 quartiers, aucun événement futur à la date du contrôle. Accès anonyme aux données privées refusé (401).
- Aucun compte, avis ou réservation de test ajouté en production. Les écritures ont été testées dans PostgreSQL local isolé.

Le commit backend publié est `44140a7`. Les sources du précédent déploiement ont été comparées à l’archive Vercel et conservées pour éviter de remplacer des modifications web déjà en ligne.

L’export ne prouve pas une exécution sur téléphone. Restent à vérifier sur Android/iOS : permissions refusées, clavier, bouton Retour système, Safe Areas, tailles de texte, VoiceOver/TalkBack, SecureStore, liens quivibe:// et cartes avec signature de distribution. Les identifiants de distribution, clés de cartes et builds de store ne sont pas configurés.

`npm audit --omit=dev` signale 14 alertes modérées transitives dans la chaîne Expo (decode-uri-component/query-string et uuid/xcode). Aucune mise à niveau forcée n’a été faite : npm propose des rétrogradations incompatibles avec SDK 57. Réévaluer avec les mises à jour Expo compatibles avant publication.
