# Validation — phases 2–3

18 septembre 2026. Périmètre : socle Expo Router et thème, sans raccordement métier.

## Vérifications

- TypeScript mobile : `npm run type-check`.
- Compatibilité SDK : `npx expo install --check` (dépendances alignées).
- Compilation des bundles Android, iOS et web : `npm run export`.
- TypeScript web : compilateur du projet web avec `--noEmit --incremental false` (réussi). Aucun code web modifié pendant cette étape.
- Recette navigateur : routes et liens profonds, sélection/réinitialisation de catégorie, page introuvable, absence d’erreurs JavaScript, largeur 320 px. Script : smoke-navigation.cjs ; utilise Chromium via Playwright installé dans le projet web.
- Aperçu : navigation-home.png.

Commande de recette sur ce poste, après l’export terminé :

```powershell
node docs/smoke-navigation.cjs 'C:\dev\Quivibe-newApp-final\apps\web\node_modules\@playwright\test'
```

Pour un autre poste, installer Playwright et son navigateur de test, puis passer le chemin du module au script.

## Limites de cette validation

Les bundles ne prouvent pas une recette physique Android/iOS. Retour système, grands caractères, VoiceOver/TalkBack et comportement des liens quivibe:// doivent être vérifiés sur appareils. Aucun parcours métier, base de données, session ou appel de production n’a été testé dans cette étape.

Le catalogue, les filtres, la recherche, les menus, la connexion, les mutations serveur et Quivibe AI affichent leur indisponibilité. Les écrans sont des points d’entrée de navigation en attente des phases suivantes, pas une application métier terminée.

Le logo source a été repris ; les identifiants de distribution et les déclinaisons finales des icônes restent à préparer avant publication.