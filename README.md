# ProjetLIFAP5 Programmation Fonctionnelle pour le Web

COQUERY Emmanuel 

### Authors

- Allan DE CLERCQ - L2 INFORMATIQUE

# Consigne

### Présentation du projet

L’objectif de ce projet est de mettre en pratique ce qui a été vu dans l’UE LIFAP5 à travers la réalisation de la partie client, entièrement en JavaScript dans le navigateur et sans serveur, d’une application de jeu POKEMON.

L’application va permettre de gérer des pokemons: consulter le catalogue des pokemons (a.k.a. Pokedex), de choisir les pokemons que l’on souhaite placer dans son deck et de se confronter à un adversaire lors d’un combat de pokemons. L’intégralité du serveur REST (backend) ainsi qu’une version de départ du client vous sont fournis.

Votre tâche consiste à ajouter des fonctionnalités au client pour pouvoir consulter le pokedex, constituer un deck et effectuer un combat de pokemons.

### Informations importantes

Le projet est à réaliser en monôme ou en binôme constitué au sein du même groupe de TD. Donner dans https://tomuss.univ-lyon1.fr:
- l’URL de votre dépôt sur https://forge.univ-lyon1.fr/
- le Nom de votre binôme

Le serveur https://lifap5.univ-lyon1.fr est en ligne, sa page d’accueil contient toutes les informations utiles.

## Pokemons: partie serveur

Cette partie est entièrement réalisée par l’équipe pédagogique. Le serveur https://lifap5.univ-lyon1.fr est en production, accessible publiquement sur internet. Le code du serveur contenant ainsi que l’intégralité des ressources associées sont publiquement accessible sur la forge de Lyon1.

Si vous constatez des bugs ou des fonctionnalités manquantes, utilisez le gestionnaire de ticket. Les issues et a fortiori les merge requests pertinentes seront favorablement valorisées dans l’évaluation.
Fonctionnalités de l’API REST

Le serveur peut répondre au requêtes décrites ci-dessous. Certaines requêtes nécessitent de s’authentifier auprès du serveur en fournissant le header Api-Key (voir plus bas). Ces requêtes sont signalée via l’indication (Authentification nécessaire).

Le serveur gère deux types de données:

GET sur `/whoami` (Authentification nécessaire): renvoie un document JSON contenant un champ user contenant l’utilisateur reconnu via l’authentification. Par exemple:
	{ "user": "p12345678" }

GET sur `/pokemon` : renvoie un tableau contenant les pokemons connus par le serveur avec des détails sur chaque pokemon. Par exemple:
```
    [
      {
        "Abilities": ["Overgrow", "Chlorophyll"],
        "Against": {
          "Bug": 1,
          "Dark": 1,
          "Dragon": 1,
          "Electric": 0.5,
          "Fairy": 0.5,
          "Fight": 0.5,
          "Fire": 2,
          "Flying": 2,
          "Ghost": 1,
          "Grass": 0.25,
          "Ground": 1,
          "Ice": 2,
          "Normal": 1,
          "Poison": 1,
          "Psychic": 2,
          "Rock": 1,
          "Steel": 1,
          "Water": 0.5
        },
        "Attack": 49,
        "BaseEggSteps": 5120,
        "BaseHappiness": 70,
        "BaseTotal": 318,
        "CaptureRate": 45,
        "Classification": "",
        "Defense": 49,
        "ExperienceGrowth": 1059860,
        "Generation": 1,
        "HeightM": 0.7,
        "Hp": 45,
        "Images": {
          "Full": "https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png",
          "Detail": "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png"
        },
        "IsLegendary": 0,
        "JapaneseName": "Fushigidaneフシギダネ",
        "Name": "Bulbasaur",
        "PercentageMale": 88.1,
        "PokedexNumber": 1,
        "SpAttack": 65,
        "SpDefense": 65,
        "Speed": 45,
        "Types": ["grass", "poison"],
        "WeightKg": 6.9
      },
      {
        /* ici les valeurs pour un deuxième pokemon */
      }
    ]

```javascript

- GET `/deck/:id` (Authentification nécessaire): Permet de récupérer le deck d’un utilisateur. Pour l’utiliser, il faut remplacer `:id` par le login de l’utilisateur. Renvoie un tableau d’entier contenant les numéros des pokémons du deck (qui correspondent au champ PokedexNumber de ces pokemons). Par exemple une requête sur `/deck/p12345678` renverrait le contenu du deck de l’utilisateur `p12345678` qui pourrait être:

```
[1, 7, 205]
```

- POST `/deck` (Authentification nécessaire): Mets à jour le deck de l’utilisateur reconnu par l’authentification. Il faut envoyer le nouveau deck comme un tableau d’`int` au format JSON dans le corps de la requête (sans oublier le header `Content-Type` avec pour valeur `application/json`). La requête répond en renvoyant le tableau qui a été stocké sur le serveur, par exemple:

```
[1, 7, 205]
```

Remarque: contrairement à la requête précedente, il n’y a pas de nom d’utilisateur dans l’URL. le nom est déduit via l’authentification.

- POST `/fight` (Authentification nécessaire): Permet de lancer un combat contre un adversaire tiré au hasard. 3 pokemons (au maximum) sont choisis dans le deck de l’utilisateur et de l’adversaire choisi. L’utilisateur courant est le joueur de gauche (left) et l’adversaire tiré au hasard est le joueur de droite ( right). La réponse de la requête contient: les pokemons choisis pour chacun des adversaires, le côté qui a gagné le combat ainsi que les différents rounds du combat. Un round contient les informations suivantes: pokemon de gauche, pokemon de droite, côté qui attaque, type d’attaque, dégâts de l’attaque et un booléen qui indique si le pokemon attaqué est KO à la suite de l’attaque. L’information ainsi transmise permet de rejouer le combat dans l’interface utilisateur. Un exemple de réponse pourrait être:

```
    {
      "DeckLeft": {
        "User": "p12345678",
        "Pokemons": [2, 25, 19]
      },
      "DeckRight": {
        "User": "p23456789",
        "Pokemons": [25, 27, 34]
      },
      "Winner": "right",
      "Rounds": [
        {
          "Left": 2,
          "Right": 25,
          "AttackFrom": "right",
          "Type": "electric",
          "Damage": 5,
          "KO": false
        },
        {
          "Left": 2,
          "Right": 25,
          "AttackFrom": "left",
          "Type": "poison",
          "Damage": 10,
          "KO": false
        }
        /* encore d'autres rounds */
      ]
    }
    
```javascript

### Authentification

Pour les requêtes qui nécessitent une authentification, il faut ajouter un header `Api-Key` dont la valeur est une clé d’API. Chaque étudiant dispose d’une clé d’API indiquée dans tomuss. En cas de clé erronée, la réponse du serveur aura un statut `401`.

## Pokemons: partie client

### Code de départ

Un client de départ est fourni dans l’archive client.zip. Cette archive comprend trois fichiers:

- `index.html` contient le squelette de la page, rempli avec des données fictives. Cela permet d’avoir une idée de ce à quoi pourra ressembler l’application une fois que l’on utilisera les données du serveur.
- `bulma.min.css` Il s’agit de la bibliothèque CSS Bulma, qui fourni un ensemble de styles CSS fournissant un ensemble de composants simples. Cette bibliothèque n’inclus pas de Javascript, il faudra donc coder les interactions utilisateur de votre côté. Ce fichier est chargé par `index.html`.
- `client.js` contient du code Javascript de départ pour le projet. Ce code comprend l’affichage d’une boîte de dialogue “Utilisateur” et l’affichage de l’utilisateur correspondant à la clé d’API de la constante apiKey. Chacune de ces fonctionnalités correspond à autant d’exemples dont vous pourrez vous inspirer.

### Fonctionnalités à implémenter

Remarque: dans ce qui suit, lorsque l’on parle d’afficher un pokemon, il faut au minimum afficher son nom ou son image. Le numéro du pokemon ne suffit pas.

Dans ce projet, il est demandé de compléter le client en ajoutant une partie fonctionnalités suivantes:

- **Affichage de l’ensemble des pokemons du serveur** `(2 points)`: il s’agit de remplacer les données de la table des pokemons par les données issues du serveur lifap5 (GET /pokemon, voir ci-dessus).

- **Connexion** `(4 points)`: modifier la boîte de dialogue de l’utilisateur de façon à pouvoir saisir une clé d’API dans un champ de type password, puis permettre de vérifier que cette clé fonctionne en utilisant la route /whoami (comme dans le code fourni, la différence est que le code fourni utilise la clé déclarée en constante). Changer l’affichage du bouton de façon à afficher Connexion si la clé d’API n’est pas valable (y compris si elle est vide). Changer également cet affichage pour afficher le login de l’utilisateur et un bouton “Déconnexion” à la place du bouton connexion si la clé d’API est valide.

- **Détail d’un pokemon** `(4 points)`: modifier le comportement de l’application de telle manière que lorsque l’on clique sur un pokemon dans la table des pokemons, les détails de ce pokemon soient affichés sur le côté. On affichera en particulier les types d’attaque pour lesquels ce pokemon est résistant (valeur inférieure à 1 dans le dictionnaire Against) ou faible (valeur supérieure à 1 dans le dictionnaire Against). Si elle est affichée dans la table des pokemons, la ligne correspondant au pokemon détaillé sera mise en surbrillance.

	**Remarque**: Object.keys(obj) permet d’obtenir le tableau des clés du dictionnaire obj, cf doc.

- **Recherche de pokemon** `(2 points)`: ajouter un champ de recherche qui permettra de chercher des pokemons en fonction de leur nom. Lorsque du texte est présent dans ce champ, on affichera que les pokemons dont le nom contient la valeur saisie.

- **Tri de la table des pokemons** `(4 points)`: faire que lorsque l’on clique sur un titre d’une colonne dans la table des pokemons, cette dernière soit triée selon cette colonne. Si la colonne cliquée est déjà utilisée pour déterminer l’ordre des lignes de la table, le clic inversera cet ordre. On ajoutera un symbole ou une icône dans le titre de colonne pour indiquer la colonne utilisée pour le tri ainsi que le sens du tri.

- **Limitation du nombre de pokemons affichés** `(4 points)`: Limiter l’affichage des pokemons aux 10 premiers pokemons. Ajouter un bouton permettant d’augmenter cette limite de 10 pokemons supplémentaires. Un appui répété sur ce bouton permettra d’afficher toujours plus de pokemons. Ajouter également un bouton pour afficher moins de pokemons (10 pokemons de moins à chaque clic, avec une limite minimale à 10 pokemons).

- **Lancement d’un combat de pokemons** `(2 points)`: Permettre de basculer l’affichage “Pokedex” vers un affichage “Combat” contenant un bouton pour lancer un combat. Un clic sur ce bouton déclenchera une requête pour réaliser un combat sur le serveur (POST sur `/fight`, cf ci-dessus). Une fois le résultat du combat reçu, on affichera un message pour indiquer si l’utilisateur a gagné le combat ou non. On affichera également la liste des rounds avec les différentes informations pour chaque round (pokemons concernés, attaques, etc)

- **Simulation de combat de pokemons** `(4 points)`: Améliorer l’affichage des rounds: on affiche un seul round à la fois. Toutes  les secondes, jusqu’à épuisement des rounds, on affiche le round suivant. Par ailleurs, on affichera les pokemons du deck de chaque participant et on indiquera si ces pokemons sont KO ou non. Cet affichage devra être synchronisé avec l’affichage des rounds (i.e. un pokemon ne sera indiqué comme KO que si le round où il a été mis KO est passé).

- **Édition du deck de pokemons** `(2 points)`: Permettre d’ajouter ou de supprimer un pokemon du deck de l’utilisateur. Cette modification du deck devra être persistée sur le serveur (utilisation de POST `/deck`, c.f. ci-dessus). On pourra par exemple ajouter des boutons d’ajouter/suppression de pokemon dans la table des pokemons ou bien dans l’affichage du détail d’un pokemon.

- **Affichage du deck de l’utilisateur** `(2 points)`: Implémenter la bascule vers l’onglet “Mes pokemons” qui limitera l’affichage aux pokemons du deck de l’utilisateur (récupérés via GET /deck/:id, c.f. ci-dessus).

- **Votre fonctionnalité**: Vous pouvez proposer vos propres fonctionnalités. Afin qu’elles puissent être prises en compte, il faudra demander à un enseignant de l’UE son aval et le nombre de points que cette fonctionnalité pourra vous rapporter. En l’absence de réponse d’un enseignant, la fonctionnalité rapportera zéro point.

### Qualité de code

Il est demandé de fournir un code aillant une qualité minimale:

- Le code doit être bien indenté.
- Chaque fonction doit posséder un commentaire expliquant ce qu’elle fait, ses arguments en entrée et ce qu’elle renvoie. On pourra s’inspirer des commentaires du code fourni pour un exemple de formattage de ces commentaires.
- Les fonctions devront être courtes (moins de 20 lignes) et les lignes faire moins de 80 caractères. Ce dernier point peut être vérifié par eslint. Il faudra donc découper votre code et vos fonctionnalités complexes en functions simples.
- Les fonctions qui ne sont pas directement liées à l’affichage (par exemple une fonction qui calcule un tableau de pokemons à afficher) devront être testées. Il est possible pour cela de reprendre le système de tests (via mocha et chai) mis en place pour les TPs 2 et 3.

De plus, le style impératif est interdit, sauf pour modifier la page web. Par exemple, il est autorisé de faire des affectations sur les champs onclick ou innerHTML, mais il est interdit de faire des boucles avec un compteur. Il s’agit d’un exercice de style afin de montrer que vous êtes capable d’adopter le style fonctionnel pour programmer. En particulier l’usage et var et let est interdit, seul const peut être utilisé. Si vous suivez le principe de fonctionnement du code fourni, seule la fonction metAJourPage contiendra des affectations en dehors des déclarations const.
