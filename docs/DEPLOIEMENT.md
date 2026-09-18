# Mise en service et essai Android

## Livraison du 18 septembre 2026

- API mobile publique : `https://quivibe.vercel.app/api/mobile/`.
- Dépôt backend : `https://github.com/Gastonlok/Quivibe-newApp`, branche `main`, commit `44140a7`.
- Déploiement vérifié : `dpl_87nUoB1BEzBGd44Wxgg2FpUPKJND`, URL `https://quivibe-vhg3wgq9o-quivibe.vercel.app`.
- Déploiement précédent conservé par Vercel : `dpl_4ar9V8YzwYHETk9h1MshsduTBf1N`.
- Copie de livraison locale : `C:/dev/quivibe-backend-mobile-release`. Le dossier web de travail original conserve ses modifications.
- Projet Vercel : `quivibe`, racine `apps/web`. Le lien local historique vers le projet `web` n’a pas été utilisé.
- Les 25 fichiers web déjà publiés mais absents de GitHub ont été vérifiés contre l’archive des sources Vercel, puis conservés dans le commit de référence `49f4538`. Aucun recul de design ou de schéma.
- Aucune migration en attente lors du déploiement : la migration de photo principale était déjà appliquée en production.
- Aucun secret ajouté à Git. Les fichiers d’environnement locaux sont exclus de la livraison.

## Essai Android avec Expo Go

Installer une version d’Expo Go compatible SDK 57 via [Expo Go](https://expo.dev/go). Connecter le téléphone et le PC au même Wi-Fi.

Depuis le dépôt mobile :

```powershell
$env:EXPO_PUBLIC_API_URL = 'https://quivibe.vercel.app'
npx expo start --lan --port 8081
```

Scanner le QR affiché par Expo Go. L’adresse réseau dépend du PC et du Wi-Fi ; utiliser celle annoncée par Metro. Le serveur doit rester lancé pendant cet essai. Il s’agit d’une version de développement, pas d’un APK autonome.

Parcours à vérifier sur le téléphone : onboarding sans localisation, recherche, galerie, favoris avec connexion, clavier, retour Android, réservation et annulation sur un établissement explicitement prévu pour la recette. Ne pas réserver auprès d’un établissement réel uniquement pour tester.

## Contrôles reproductibles

```powershell
# Mobile : lectures réelles de production, sans écrire de données
node docs/check-live-api.cjs

# Backend : schémas PostgreSQL locaux temporaires uniquement
pnpm run test:reservations:db
node scripts/test-mobile-http.cjs
```

Le test HTTP crée ses propres fixtures, enregistre une réservation, vérifie l’idempotence et l’annulation, puis supprime son schéma temporaire. Les clés d’email sont désactivées pour cette recette.

Les tests sur téléphone physique, les builds APK/AAB, les identifiants de distribution et la publication Play Store restent distincts de cette mise en service de l’API.
