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

Un appel HTTP local à `/api/mobile/search-options` renvoie 503. Le diagnostic Prisma en lecture seule confirme que le serveur PostgreSQL configuré est inaccessible. Aucune réservation réelle n’a donc été créée ou confirmée pendant cette recette. Les adaptations ne sont pas encore déployées sur Vercel.

L’export ne prouve pas une exécution sur téléphone. Restent à vérifier sur Android/iOS : permissions refusées, clavier, bouton Retour système, Safe Areas, tailles de texte, VoiceOver/TalkBack, SecureStore, liens quivibe:// et cartes avec signature de distribution. Les identifiants de distribution, clés de cartes et builds de store ne sont pas configurés.

`npm audit --omit=dev` signale 14 alertes modérées transitives dans la chaîne Expo (decode-uri-component/query-string et uuid/xcode). Aucune mise à niveau forcée n’a été faite : npm propose des rétrogradations incompatibles avec SDK 57. Réévaluer avec les mises à jour Expo compatibles avant publication.
