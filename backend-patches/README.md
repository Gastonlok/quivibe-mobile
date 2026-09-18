# Adaptations du backend existant

`mobile-api.patch` contient uniquement neuf fichiers du projet web : trois modifications et six ajouts (dont trois fichiers de tests). Ce n’est pas un second serveur.

Les changements sont **déjà appliqués** à `C:/dev/Quivibe-newApp-final`. Leur application inverse a été vérifiée avec `git apply --reverse --check`. Le projet web local conserve ses autres modifications.

Sur un autre checkout du **même projet web**, depuis la racine du monorepo :

```powershell
git apply --check C:/chemin/quivibe-mobile/backend-patches/mobile-api.patch
git apply C:/chemin/quivibe-mobile/backend-patches/mobile-api.patch
```

Si le contrôle signale un conflit, examiner les différences et porter les adaptations ; ne pas forcer l’écrasement. Aucune migration ni nouvelle variable secrète. Les modules métier importés doivent provenir du projet web de référence.

Validation depuis `apps/web` :

```powershell
npx tsc --noEmit
npx vitest run features/mobile features/admin/session.test.ts features/reservations features/places features/ai
```

Voir [INTEGRATION.md](../docs/INTEGRATION.md) pour les endpoints, l’authentification, le CORS et la mise en production.
