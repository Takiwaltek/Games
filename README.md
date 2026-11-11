# Atelier de Takiwaltek

Site de présentation des projets de Takiwaltek, publié sur GitHub Pages : https://takiwaltek.github.io/Games/

## Contenu du site

- **Accueil** (`index.html`) : liens vers les projets, nouveautés Steam, widget du Discord officiel de Satisfactory et tchat en direct (Firebase).
- **Calculateur** (`calculateur/`) : planificateur de production Satisfactory. Le code source est dans un autre projet, seul le build est ici.
- **Carte de la base** (`carte/`) : carte Satisfactory.
- **Jeux** :
  - `jeux/chasse-pixels/`
  - `jeux/briques-tombantes/`
  - `jeux/chevalier-des-sables/`
- **À propos** (`a-propos/`).
- **NEON//REVOLUTION** (`1/`) : jeu d'idle sur un réseau cyberpunk. Clic sur le cœur ou touche **Espace** pour générer des octets, touche **M** pour acheter tous les niveaux disponibles, sauvegarde automatique dans le navigateur.

## Déploiement

Le workflow `.github/workflows/pages.yml` publie le dépôt sur GitHub Pages :

- à chaque push sur `main` ;
- chaque jour à 06 h UTC ;
- en lancement manuel.

Avant la publication, `scripts/fetch-steam-news.mjs` génère le fil des nouveautés Steam.

## Tester en local

Lance un serveur statique à la racine du dépôt plutôt que d'ouvrir `index.html` directement, car le chargement du fil Steam peut échouer sur un fichier local.

