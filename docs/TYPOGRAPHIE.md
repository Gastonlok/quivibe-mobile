# Typographie

Référence vérifiée le 18 septembre 2026 : https://www.jw.org/fr/ et sa feuille de style publique https://www.jw.org/assets/ct/28ada02fb0/collector.css.

L’interface latine du site déclare Noto Sans, en regular 400 et bold 700. Quivibe utilise la même famille via @expo-google-fonts/noto-sans, avec deux fichiers TTF embarqués et chargés par expo-font. Aucun téléchargement de police au lancement et aucune dépendance au CDN de jw.org. Il ne s’agit pas d’une copie exacte de la version des fichiers utilisée par ce site, ni d’une vérification de la typographie interne de JW Library.

- Corps : 16/25, regular.
- Titres de pages : 30/40, bold.
- Sections : 22/30, regular.
- Libellés : 15/22, bold.
- Titres promotionnels : 42/52, bold, espacement naturel.
- Onglets et en-têtes : même famille.

Les styles communs sont centralisés dans src/typography.ts. La mise à l’échelle système reste active. Le logo bitmap Quivibe conserve son graphisme.

Licence de la police : SIL Open Font License, conservée dans NotoSans-LICENSE.txt. Vérifications : TypeScript, export des trois plateformes et recette navigateur avec contrôle du chargement des deux fontes. La recette physique Android/iOS reste à effectuer.