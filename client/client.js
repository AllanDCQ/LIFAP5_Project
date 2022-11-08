/* ******************************************************************
 * Constantes de configuration
 * ****************************************************************** */
//const apiKey = "92dde843-d12d-4af5-9cf9-4baf0a403510";
const serverUrl = "https://lifap5.univ-lyon1.fr/";

/* ******************************************************************
 * Gestion de la boîte de dialogue (a.k.a. modal) d'affichage de
 * l'utilisateur.
 * ****************************************************************** */

/**
 * Fait une requête GET authentifiée sur /whoami
 * @returns une promesse du login utilisateur ou du message d'erreur
 */
 function fetchWhoami(apiKey) {
  return fetch(serverUrl + "whoami", { headers: { "Api-Key" : apiKey } }) 
    .then((response) => {
      if (response.status === 401) {
        return response.json().then((json) => {
          console.log(json);
          return { err: json.message };
        });
      } else {
        return response.json();
      }
    })
    .catch((erreur) => ({ err: erreur }));
}

/**
 * Fait une requête sur le serveur et insère le login dans la modale d'affichage
 * de l'utilisateur puis déclenche l'afface la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir ichage de cette modale.
 *
 * @param {Etat} etatCourant l'état courant
 * @returns Une promesse de mise à jour
 */
 function lanceWhoamiEtInsereLogin(apiKey, etatCourant) {
  return fetchWhoami(apiKey).then((data) => {
    majEtatEtPage(etatCourant, {
      login: data.user, // qui vaut undefined en cas d'erreur
      errLogin: data.err, // qui vaut undefined si tout va bien
      loginModal: false, // on affiche la modale, ici mise à false pour que la fenetre se ferme
      //apiKey: undefined,
      //connected: false */
    });
  });
}

/**
 * Génère le code HTML du corps de la modale de login. On renvoie en plus un
 * objet callbacks vide pour faire comme les autres fonctions de génération,
 * mais ce n'est pas obligatoire ici.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et un objet vide
 * dans le champ callbacks
 */
 function genereModaleLoginBody(etatCourant){
  const text =
    etatCourant.errLogin !== undefined
      ? etatCourant.login
      : 'Clé d\'API non renseignée ou inconnue';
  return {
    html:`
    <section class="modal-card-body">
     <p>${text}</p>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Clé d'API</label>
          <input type="password" id="loginKey" class="input" placeholder="veuillez insérer votre clé">
        </div>
      </section>`
    ,
    callbacks:{
      "submit-api-key": {
        onclick: ()=>lanceWhoamiEtInsereLogin(
          document.getElementById("loginKey").value,etatCourant)
      }
    }
  }
}

/**
 * Génère le code HTML du titre de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLoginHeader(etatCourant) {
  return {
    html: `
<header class="modal-card-head  is-back">
  <p class="modal-card-title">Utilisateur</p>
  <button
    id="btn-close-login-modal1"
    class="delete"
    aria-label="close"
    ></button>
</header>`,
    callbacks: {
      "btn-close-login-modal1": {
        onclick: () => majEtatEtPage(etatCourant, { loginModal: false }),
      },
    },
  };
}


/**
 * Génère le code HTML du base de page de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
 function genereModaleLoginFooter(etatCourant){
  return {
    html: `
      <footer class="modal-card-foot" style="justify-content: flex-end">
        <button id="btn-close-login-modal2" class="button">Fermer</button>
        <button class="is-success button" id="submit-api-key" tabindex="0">Valider</button>
      </footer>`
    ,
    callbacks: {
      "btn-close-login-modal2": { onclick: () => majEtatEtPage(etatCourant, {loginModal: false, login: undefined })},
      "submit-api-key" : { 
          onclick : () => {
            const loginKey = document.getElementById('login-key').value; // récupération du champ api key
            lanceWhoamiEtInsereLogin(loginKey, etatCourant, {loginModal: false});
            majEtatEtPage(etatCourant, { loginModal: false, apiKey: loginKey });
        }
      } 
    },
  };
}

function showUser(etatCourant){
  const html=`
  <div class="navbar-end">
    <div class="navbar-item">
      <a id="btn-open-login-modal" class="button is-light"> ${etatCourant.login} </a>
    </div>
  </div>`;
  return{
    html:html,
    callbacks:{}
  };
}

/**
 * Génère le code HTML de la modale de login et les callbacks associés.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereModaleLogin(etatCourant) {
  const header = genereModaleLoginHeader(etatCourant);
  const footer = genereModaleLoginFooter(etatCourant);
  const body = genereModaleLoginBody(etatCourant);
  const activeClass = etatCourant.loginModal ? "is-active" : "is-inactive";
  return {
    html: `
      <div id="mdl-login" class="modal ${activeClass}">
        <div class="modal-background"></div>
        <div class="modal-card">
          ${header.html}
          ${body.html}
          ${footer.html}
        </div>
      </div>`,
    callbacks: { ...header.callbacks, ...footer.callbacks, ...body.callbacks },
  };
}

/* ************************************************************************
 * Gestion de barre de navigation contenant en particulier les bouton Pokedex,
 * Combat et Connexion.
 * ****************************************************************** */

/**
 * Déclenche la mise à jour de la page en changeant l'état courant pour que la
 * modale de login soit affichée
 * @param {Etat} etatCourant
 */
function afficheModaleConnexion(etatCourant) {
 majEtatEtPage(etatCourant, {loginModal:true});
}

/**
 * Génère le code HTML et les callbacks pour la partie droite de la barre de
 * navigation qui contient le bouton de login.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBoutonConnexion(etatCourant) {
  etatCourant.login === undefined ? "Connexion" : "Deconnexion"; 
    const html = `
      <div class="navbar-item">

        <button class="button is-info" id="btn-open-login-modal" >
          <span class="icon is-small" padding="15px">
            <i class="fas fa-user" alt="connexion" ></i>
          </span>
          <span>Connexion</span>
        </button>



      </div>`;
  return {
    html: html,
    callbacks: {
      "btn-open-login-modal": {
        onclick: () => etatCourant.login ===undefined ? afficheModaleConnexion(etatCourant) :majEtatEtPage(etatCourant, {login:undefined})
      },
    },
  };
}

function AfficheUtilisateur(etatCourant){
  const html=`
  <div class="navbar-end">
    <div class="navbar-item">
      <a id="btn-open-login-modal" class="button is-light"> ${etatCourant.login} </a>
    </div>
  </div>`;
  return {
    html:html,
    callbacks:{}
  };
}

/**
 * Génère le code HTML de la barre de navigation et les callbacks associés.
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function genereBarreNavigation(etatCourant) {
  const connexion = genereBoutonConnexion(etatCourant);
  const searchBarH = searchBar(etatCourant);
  const id = etatCourant.login!==undefined ? AfficheUtilisateur(etatCourant).html:'';
  return {
    html: `
<balise id="hautDePage"></balise>
<section>
  <div id="menuImage" class="columns is-mobile is-centered" style="padding-top:15px; cursor:pointer;;">
    <div class="navbar-center image is-64x64">
      <img alt="Menu" src="https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png">
    </div>
    <span style="padding-top: 18px; padding-left:10px;"><strong>Pokemon companion</strong></span>
  </div>

  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-start">
      <div class="navbar-item"><div class="buttons">
          <a id="btn-pokedex" class="button is-info"> Pokedex </a>
          <a id="btn-combat" class="button is-info"> Combat </a>
      </div>
    </div>

    </div>
    <div class="navbar-end">
      <div class="control" style="padding-top: 10px;">
        <input class="input is-info input is-rounded" type="text" id="nameSearchid" value="${etatCourant.searchName}">
      </div>
      <div id="Rechercher" style="padding-top: 22px; padding-left: 10px; padding-right: 80px; cursor: pointer;">
            <i class="fa fa-search" ></i>
      </div>
      ${connexion.html} ${id}
    </div>
  </nav>
</section>`,
    callbacks: {
      ...connexion.callbacks,
      ...searchBarH.callbacks,
      "menuImage" : { onclick : () => initClientPokemons()}
    },
  };
}



/**
 * Génére le code HTML de la page ainsi que l'ensemble des callbacks à
 * enregistrer sur les éléments de cette page.
 *
 * @param {Etat} etatCourant
 * @returns un objet contenant le code HTML dans le champ html et la description
 * des callbacks à enregistrer dans le champ callbacks
 */
function generePage(etatCourant) {
  const barredeNavigation = genereBarreNavigation(etatCourant);
  const modaleLogin = genereModaleLogin(etatCourant);
  const pokemons = afficherPokemons(etatCourant);
  const genereCard = genereDetailPokemon(etatCourant);
  const headerSection = headerSectionPokedex(etatCourant);

  // remarquer l'usage de la notation ... ci-dessous qui permet de "fusionner"
  // les dictionnaires de callbacks qui viennent de la barre et de la modale.
  // Attention, les callbacks définis dans modaleLogin.callbacks vont écraser
  // ceux définis sur les mêmes éléments dans barredeNavigation.callbacks. En
  // pratique ce cas ne doit pas se produire car barreDeNavigation et
  // modaleLogin portent sur des zone différentes de la page et n'ont pas
  // d'éléments en commun.
  return {
    html: barredeNavigation.html + modaleLogin.html + headerSection.html + pokemons.html + genereCard.html + footerPage().html,
    callbacks: { ...barredeNavigation.callbacks, ...modaleLogin.callbacks, ...pokemons.callbacks, ...headerSection.callbacks},
  };
}





/* ******************************************************************
 * Initialisation de la page et fonction de mise à jour
 * globale de la page.
 * ****************************************************************** */

/**
 * Créée un nouvel état basé sur les champs de l'ancien état, mais en prenant en
 * compte les nouvelles valeurs indiquées dans champsMisAJour, puis déclenche la
 * mise à jour de la page et des événements avec le nouvel état.
 *
 * @param {Etat} etatCourant etat avant la mise à jour
 * @param {*} champsMisAJour objet contenant les champs à mettre à jour, ainsi
 * que leur (nouvelle) valeur.
 */
function majEtatEtPage(etatCourant, champsMisAJour) {
  const nouvelEtat = { ...etatCourant, ...champsMisAJour };
  majPage(nouvelEtat);
}

/**
 * Prend une structure décrivant les callbacks à enregistrer et effectue les
 * affectation sur les bon champs "on...". Par exemple si callbacks contient la
 * structure suivante où f1, f2 et f3 sont des callbacks:
 *
 * { "btn-pokedex": { "onclick": f1 },
 *   "input-search": { "onchange": f2,
 *                     "oninput": f3 }
 * }
 *
 * alors cette fonction rangera f1 dans le champ "onclick" de l'élément dont
 * l'id est "btn-pokedex", rangera f2 dans le champ "onchange" de l'élément dont
 * l'id est "input-search" et rangera f3 dans le champ "oninput" de ce même
 * élément. Cela aura, entre autres, pour effet de délclencher un appel à f1
 * lorsque l'on cliquera sur le bouton "btn-pokedex".
 *
 * @param {Object} callbacks dictionnaire associant les id d'éléments à un
 * dictionnaire qui associe des champs "on..." aux callbacks désirés.
 */
function enregistreCallbacks(callbacks) {
  Object.keys(callbacks).forEach((id) => {
    const elt = document.getElementById(id);
    if (elt === undefined || elt === null) {
      console.log(
        `Élément inconnu: ${id}, impossible d'enregistrer de callback sur cet id`
      );
    } else {
      Object.keys(callbacks[id]).forEach((onAction) => {
        elt[onAction] = callbacks[id][onAction];
      });
    }
  });
}

/**
 * Mets à jour la page (contenu et événements) en fonction d'un nouvel état.
 *
 * @param {Etat} etatCourant l'état courant
 */
function majPage(etatCourant) {
  const page = generePage(etatCourant);
  document.getElementById("root").innerHTML = page.html;
  enregistreCallbacks(page.callbacks);
}

/**
 * Appelé après le chargement de la page.
 * Met en place la mécanique de gestion des événements
 * en lançant la mise à jour de la page à partir d'un état initial.
 */
function initClientPokemons() {
  console.log("CALL initClientPokemons");
  const etatInitial = {
    loginModal: false,
    login: undefined,
    errLogin: undefined,

    // liste des pokemons 
    pokemons: [],

    // Attribut ciblé du tri : 'Abilities','Types','Name' ou 'Number(#)'
    orderCible: 'Number',

    // sens du tri : 'Croissant ou 'Décroissant
    orderSens: 'Croissant',

    // Pokemon selected
    selectedPokemon : undefined,

    selectedPokemonName : 'Abra',

    // nb de pokemon a afficher
    pokemonAff : 10,

    // input de la barre de recherche
    searchName : '',


    deck_list : [],
    //deck de l'utilisateur
    deck_pokemons : [],

    //page selectionne
    pageSelected : "all-pokemons"
    
  };
  charge_pokemons(etatInitial);
  charge_deck(etatInitial);
  majPage(etatInitial); 

}

// Appel de la fonction init_client_duels au après chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Exécution du code après chargement de la page");
  initClientPokemons();

});




const baseUrl = 'https://lifap5.univ-lyon1.fr'


/*******************************************************************
 *                     @function charge_pokemons                   *
 * @returns les pokemons du .json du serveur                       *
 * @param {Etat} etatCourant : l'état courant                      *
 *******************************************************************/
function charge_pokemons(etatCourant) {
  console.log("function charge_donnees() ...")

  return fetch(baseUrl+'/pokemon')
      .then(reponse => {return reponse.json()})
      .then(pokemons => {majEtatEtPage(etatCourant,{pokemons:pokemons.sort(triPokemonsNumber(pokemons,etatCourant)), 
                                                    selectedPokemon: pokemons[0]})})
}




/*******************************************************************
 *                     @function charge_deck                       *
 * @returns les pokemons du .json du serveur                       *
 * @param {Etat} etatCourant : l'état courant                      *
 *******************************************************************/
 function charge_deck(etatCourant) {
  console.log("function charge_donnees() ...")

  return fetch(baseUrl+'/deck/'+ etatCourant.apiKey)
      .then(reponse => {return reponse.json()})
      .then(deck => {majEtatEtPage(etatCourant,{deck_list:deck,})})
}

// function traductionDeck(etatCourant) {
//   return etatCourant.deck_list.map(numPokemon => addPokemonDeck(numPokemon, etatCourant));
// }

// function addPokemonDeck(numPokemon, etatCourant) {

//   numPokemon == etatCourant.pokemon.map(pokemon => pokemon.PokedexNumber)
//     ? majEtatEtPage(etatCourant, {deck_pokemons: deck_pokemons + pokemons[pokemon]})
//     : null
// }

// function removePokemonDeck(numPokemon, etatCourant) {

// }



/*******************************************************************
 *                   @function headerSectionPokedex                *
 * @returns le header html de la section pokedex                   *
 *******************************************************************/
function headerSectionPokedex(etatCourant){

  return {
    html: `
    <section class="section" style="padding: 0;>
        <div class="columns">
          <div class="column">
            <div class="tabs is-centered">
              <ul>
                <li id="all-pokemons" class="is-active">
                  <a>Tous les pokemons</a>
                </li>
                <li id="deck-pokemons">
                  <a>Mes pokemons</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
    `,
    callbacks: {
      "all-pokemons" : {onclick: () => majEtatEtPage(etatCourant,{pageSelected : "all-pokemons", pokemonAff : 10}) 
                                      + isActiveAdd("all-pokemons")
                                      + isActiveRemove("deck-pokemons")},
      "deck-pokemons" : {onclick: () => majEtatEtPage(etatCourant,{pageSelected : "deck-pokemons", pokemonAff : 10}) 
                                      + isActiveAdd("deck-pokemons")
                                      + isActiveRemove("all-pokemons")}
    }
  };
}

function isActiveAdd (add) {
  const getAdd = document.getElementById(add).classList;

  getAdd.contains("is-active") == true
    ? null
    : getAdd.add("is-active")
}

function isActiveRemove (remove) {
  const getRemove = document.getElementById(remove).classList;

  getRemove.contains("is-active") == true
    ? getRemove.remove("is-active")
    : null
}





/*********************************************************************
 *                      @function afficherPokemons                   *
 * @returns l'affichage de la page principal                         *
 *    @html : création de la table                                   *
 *    @callback: toutes les fonctionnalités de la table              *
* @param {Etat} etatCourant : l'état courant                         *
 *********************************************************************/
function afficherPokemons(etatCourant){
  return {
    html:createTable(etatCourant).html,
    callbacks:{
      ...createTable(etatCourant).callbacks,
    } 
  };
}



/***********************************************************************************************************
 *                                         @function createTable                                           *
 * @returns la Table des pokemons                                                                          *
 *    @html : Table + les boutons de fin de page                                                           *
 *    @callback: Fonctionnalité de tous les boutons d'attribut : Abilities, Name, Type et '#'              *      
 * @param {Etat} etatCourant : l'état courant                                                              *
 *                                                                                                         *
 * @constant pokemons : cible les pokemons sur l'état courant chargé auparavant du .json                   * 
 * @constant {characters} Ordersens : (characters) Retourne le sens du tri : 'Croissant' ou 'Decroissant'  *
 *      --> utilisé dans le .html pour définir le sens du tri : 'Croissant' ou 'Decroissant' avec sort()   *
 ***********************************************************************************************************/
function createTable(etatCourant) {
  const pokemons = etatCourant.pokemons === undefined?[]:etatCourant.pokemons;
  const pokemonAff = etatCourant.pokemonAff;

  return {
    html: initialisationTable(etatCourant).html + tableBouttons(pokemonAff,etatCourant).html,

    callbacks :{ 
      "sortNumber" : {onclick: () =>  majEtatEtPage(etatCourant,{pokemons : pokemons.sort(triPokemonsNumber(pokemons,etatCourant)), pokemonAff : 10})
                                      + sens('Number',etatCourant) 
                                      + sort('Number', etatCourant) },

      "sortName" : {onclick: () => majEtatEtPage(etatCourant,{pokemons : pokemons.sort(triPokemonsName(pokemons,etatCourant)), pokemonAff : 10})
                                   + sens('Name',etatCourant) 
                                   + sort('Name', etatCourant)},

      "sortAbilities" : {onclick: () => majEtatEtPage(etatCourant,{pokemons : pokemons.sort(triPokemonsAbilities(pokemons,etatCourant)), pokemonAff : 10})
                                      + sens('Abilities',etatCourant) 
                                      + sort('Abilities', etatCourant)},

      "sortTypes" : {onclick: () => majEtatEtPage(etatCourant,{pokemons : pokemons.sort(triPokemonsTypes(pokemons,etatCourant)), pokemonAff : 10})
                                  + sens('Types',etatCourant) 
                                  + sort('Types', etatCourant)},
                                
      "lessPokemons" : {onclick: () => lessPokemons(etatCourant,pokemonAff) },
      "morePokemons" : {onclick: () => morePokemons(etatCourant,pokemonAff)},
      ...initialisationTable(etatCourant).callbacks

    }
  };
}

 
function lessPokemons(etatCourant,pokemonAff) {
  return majEtatEtPage(etatCourant, {pokemonAff : pokemonAff >10 ?pokemonAff-10 :pokemonAff} );
}

function morePokemons(etatCourant,pokemonAff) {
  const nb_max = etatCourant.pageSelected == 'all-pokemons'
                  ?Object.keys(etatCourant.pokemons).length
                  :Object.keys(etatCourant.deck_pokemons).length

  const add = (pokemonAff+10) < nb_max
    ?pokemonAff+10 
    :nb_max;

  return majEtatEtPage(etatCourant, {pokemonAff : add } );
}




/***********************************************************************************************************
 *                                      @function initialisationTable                                      *
 * @returns la tanle en html                                                                               *
 * @param {Etat} etatCourant : l'état courant                                                              *
 *                                                                                                         *
 * @constant pokemons : Retourne les pokemons recuperer du .json                                           * 
 * @constant {characters} Ordersens : Retourne le sens du tri : 'Croissant' ou 'Decroissant'               *
 * @constant {characters} pokemonAff : Retourne le nb de pokemon affiches de l'etat courant                *
 ***********************************************************************************************************/
 function initialisationTable(etatCourant) {
  const pokemons = etatCourant.pokemons === undefined?[]:etatCourant.pokemons;
  const pokemonAff = etatCourant.pokemonAff;
  return {
    html: 
`<div class= "columns">
  <div class="column" style="padding-left:30px;">
    <table id="PokemonTable" class="table">
      <thead>
        <tr>
          <th><span>Image</span></th>
          <th style="cursor: pointer;">
            <span id = "sortNumber">#</span>
            <span class="icon"><i id = "iconNumber"></i></span>
          </th>
          <th style="cursor: pointer;">
            <span id = "sortName" >Name</span>
            <span class="icon"><i id = "iconName"></i></span>
          </th>
          <th style="cursor: pointer;">
            <span id = "sortAbilities" >Abilities</span>
            <span class="icon"><i id = "iconAbilities"></i></span>
          </th>
          <th style="cursor: pointer;">
            <span id = "sortTypes" >Types
            <span class="icon"><i id = "iconTypes"></i></span></span>
          </th>
        </tr>
      </thead>
      <tbody id="tbody">
        ${pokemons.map(item => ligne_pokemon(item,etatCourant).html).slice(0, pokemonAff).join('')}
      </tbody>
    </table>
  `,
    callbacks : {
      "id_2" : {onclick : () => console.log('test')},
    }
  };
}

function triPokemonsNumber(pokemons, etatCourant) {
  const orderSens = etatCourant.orderSens;
  const deck = etatCourant.deck_pokemons === undefined?[]:etatCourant.deck_pokemons;
  const activePage = etatCourant.pageSelected;

  orderSens == 'Croissant'
    ? activePage === 'all-pokemons' 
      ? pokemons.sort(function (a,b) { return a.PokedexNumber-b.PokedexNumber; })
      : deck.sort(function (a,b) { return a.PokedexNumber-b.PokedexNumber; })
    
    : activePage === 'all-pokemons'
      ? pokemons.sort(function (a,b) { return b.PokedexNumber-a.PokedexNumber; })
      : deck.sort(function (a,b) { return b.PokedexNumber-a.PokedexNumber; })
}

function triPokemonsName(pokemons, etatCourant) {
  const orderSens = etatCourant.orderSens;
  const deck = etatCourant.deck_pokemons === undefined?[]:etatCourant.deck_pokemons;
  const activePage = etatCourant.pageSelected;

  orderSens == 'Croissant'
    ? activePage === 'all-pokemons' 
      ? pokemons.sort(function (a,b) { return a.Name > b.Name; })
      : deck.sort(function (a,b) { return a.Name> b.Name; })
    
    : activePage === 'all-pokemons'
      ? pokemons.sort(function (a,b) { return a.Name < b.Name; })
      : deck.sort(function (a,b) { return a.Name < b.Name; })
}

function triPokemonsTypes(pokemons, etatCourant) {
  const orderSens = etatCourant.orderSens;
  const deck = etatCourant.deck_pokemons === undefined?[]:etatCourant.deck_pokemons;
  const activePage = etatCourant.pageSelected;

  orderSens == 'Croissant'
    ? activePage === 'all-pokemons' 
      ? pokemons.sort(function (a,b) { return a.Types > b.Types; })
      : deck.sort(function (a,b) { return a.Types> b.Types; })
    
    : activePage === 'all-pokemons'
      ? pokemons.sort(function (a,b) { return a.Types < b.Types; })
      : deck.sort(function (a,b) { return a.Types < b.Types; })
}

function triPokemonsAbilities(pokemons, etatCourant) {
  const orderSens = etatCourant.orderSens;
  const deck = etatCourant.deck_pokemons === undefined?[]:etatCourant.deck_pokemons;
  const activePage = etatCourant.pageSelected;

  orderSens == 'Croissant'
    ? activePage === 'all-pokemons' 
      ? pokemons.sort(function (a,b) { return a.Abilities > b.Abilities; })
      : deck.sort(function (a,b) { return a.Abilities> b.Abilities; })
    
    : activePage === 'all-pokemons'
      ? pokemons.sort(function (a,b) { return a.Abilities < b.Abilities; })
      : deck.sort(function (a,b) { return a.Abilities < b.Abilities; })
}








/****************************************************************************************************************************************
 *                                                        @function ligne_pokemon                                                       *
 * @returns la ligne du pokemon 'item' selon l'odre                                                                                     *
 * @param {pokemons} item : pokemon ciblé                                                                                               *
 * @param {Etat} etatCourant : l'état courant                                                                                           *
 *                                                                                                                                      *
 * @constant OrderTypes : traduit les caractères en attribut du pokemon ciblé 'item'                                                    *
 * @constant order : récupère l'attribut ciblé par le tri en characters et le retourne en attribut grâce à orderTypes : sinon undefined * 
 ****************************************************************************************************************************************/
function ligne_pokemon(item,etatCourant) {

  return {
    html:`
      <tr "id="id_${item.PokedexNumber}" class="${etatCourant.selectedPokemon.Name == item.Name ? `is-selected`:null }">
        <td> <img src = "${item.Images.Detail}" alt ="Image de ${item.Name}" width="100" height="100"/> </td>
        <td id="${item.PokedexNumber}">${item.PokedexNumber}</td>
        <td>${item.Name}</td>
        <td>${item.Abilities.join("</br>")}</td>
        <td>${item.Types.join("</br>")}</td>
      </tr>`,

    callbacks: {

    }
  };
}






/***********************************************************************************************************
 *                                               @function sort                                            *
 * @returns l'icon du tri à son emplacement                                                                *
 * @param {Character} id : Bouton sélectioné                                                               *
 * @param {Etat} etatCourant : l'état courant                                                              *
 *                                                                                                         *
 * @constant getElement : retourne la liste de class de l'icon 'id'                                        *
 * @constant {characters} orderCible : Le nom de la colonne utilisé pour faire le tri avant le changement  * 
 * @constant {characters} sens : Retourne le sens du tri : 'Croissant' ou 'Decroissant'                    *
 ***********************************************************************************************************/
function sort(id,etatCourant) {

  const getElement = document.getElementById(`icon${id}`).classList;
  const sens = etatCourant.orderSens;

  sens == 'Decroissant'
    ? getElement.add("fas", "fa-angle-up")
    : getElement.add("fas", "fa-angle-down");
}



/***********************************************************************************************************
 *                                             @function sens                                              *
 * @returns la colonne mis a jout du sens et du tri                                                        *
 * @param {characters} id : Bouton sélectioné                                                              *
 * @param {Etat} etatCourant : l'état courant                                                              *
 *                                                                                                         *
 * @constant {characters} orderCible : Le nom de la colonne utilisé pour faire le tri avant le changement  * 
 * @constant {characters} sens : Retourne le sens du tri : 'Croissant' ou 'Decroissant'                    *
 ***********************************************************************************************************/
function sens(id,etatCourant) {
  const sens = etatCourant.orderSens;

  sens == 'Croissant'
    ? majEtatEtPage(etatCourant,{orderCible:id, orderSens:'Decroissant'}) 
    :majEtatEtPage(etatCourant,{orderCible:id, orderSens:'Croissant'}) 
}


/***********************************************************************************************************
 *                                      @function tableBouttons                                            *
 * @returns le html des boutons 'more', 'less' et 'Retourner en haut de la page'                           *
 * @param {intger} pokemonAff : le nombre de pokeom affiches                                                             * 
 * @param pokemons : cible les pokemons sur l'état courant chargé auparavant du .json                      * 
 ***********************************************************************************************************/
function tableBouttons(pokemonAff,etatCourant) {

  return{
    html: `
    <section style="padding-left : 130px;">
      <div style="padding-bottom : 15px; padding-left : 7px;">
        <span><button class="button is-danger" id="lessPokemons">Less</button></span>
        <span class="tag is-light is-medium">
          ${pokemonAff}/${etatCourant.pageSelected == 'all-pokemons'
                            ? Object.keys(etatCourant.pokemons).length
                            : Object.keys(etatCourant.deck_pokemons).length}
        </span>
        <span><button class="button is-success" id="morePokemons">More</button></span>
      </div>
      <div class="tag is-info is-medium">
        <a href="#hautDePage" style="text-decoration:none; color:white;"> Retourner en haut de la page </a>
      </div>
    </section>
  </div>`,
  };
}






/************************************************************************************************
 *                                      @function searchBar                                     *
 * @returns Gere les callbacks de la barre de recherche                                         *
 * @param {Etat} etatCourant : L'etat courant                                                   * 
 ************************************************************************************************/
function searchBar(etatCourant) {
  const pokemonAff = etatCourant.pokemonAff;

  return {
    callbacks: {
      "Rechercher" : { onclick : () => charge_listPokemonsSearch(etatCourant)  },
      "nameSearchid" : {onkeyup : enter => inputKeyENTER(enter,etatCourant) }
    }
  };
}

/***********************************************************************************************************
 *                                     @function charge_listPokemonsSearch                                 *
 * @returns retourne charge_listPokemonsSearch si le character est : 'ENTER'                               *
 * @param {Etat} etatCourant : l'état courant                                                              *
 * @param enter : le caracter entree dans la barre de recherche                                            *
 ***********************************************************************************************************/
 function inputKeyENTER(enter,etatCourant) {
  return enter.keyCode == 13 ?charge_listPokemonsSearch(etatCourant): null ;
}



/***********************************************************************************************************
 *                                     @function charge_listPokemonsSearch                                 *
 * @returns la colonne mis a jout du sens et du tri                                                        *
 * @param {Etat} etatCourant : l'état courant                                                              *
 *                                                                                                         *
 * @constant {Character}  input : Raccourci retournant la valeur entree dans la barre de recherche         * 
 ***********************************************************************************************************/
function charge_listPokemonsSearch(etatCourant) {

  const input = document.getElementById("nameSearchid").value;

  return fetch(baseUrl+'/pokemon')
        .then(reponse => {return reponse.json()})
        .then(pokemons => { majEtatEtPage(etatCourant, {pokemons: pokemons.filter(item => item.Name.toLowerCase().search(input.toLowerCase()) >= 0),
         searchName: input})})
}







/*******************************************************************************************
 *                                @function genereDetailPokemon                            *
 * @returns                                                                                *
 *    @html le code html de la carte du pokemon slectionnee                                *
 *    @callbacks                                                                           *
 * @param {Etat} etatCourant : l'état courant                                              *
 *******************************************************************************************/
function genereDetailPokemon(etatCourant){
  return {
    html : CardDetail(etatCourant),
  };
}





/*******************************************************************************************
 *                                     @function CardDetail                                *
 * @returns le code html de la carte du pokemon slectionnee                                *  
 * @param {Etat} etatCourant : l'état courant                                              *
 *                                                                                         *
 * @constant selectPokemon : le pokemon selectionne                                        * 
 *******************************************************************************************/
function CardDetail(etatCourant){
  const selectPokemon = etatCourant.selectedPokemon;
  return `
    <div class="column" style="padding-top:100px; padding-right:100px;">
      <div id="pokemon-card" class="card">
        ${selectPokemon === undefined? null : detailPokemonCard(selectPokemon,etatCourant).html}
      </div>
    </div>
  </div>
  `
}



/*******************************************************************************************
 *                                 @function detailPokemonCard                             *
 * @returns le code html des details de la carte du pokemon slectionnee                    *  
 * @param item : pokemon selectionne                                                       *
 *******************************************************************************************/
function detailPokemonCard(item,etatCourant){
  return {
    html: `
    <div class="card-header">
      <div class="card-header-title">${item.JapaneseName}</div>
    </div>
    <div class="card-content">
      <article class="media">
        <div class="media-content">
          <h1 class="title">${item.Name}</h1>
        </div>
      </article>
    </div>
    <div class="card-content">
      <article class="media">
        <div class="media-content">
          <div class="content has-text-left">
            <p>Hit points: ${item.Attack}</p>
            <h3>Abilities</h3>
              ${abilitiesList(item)}
            <h3>Resistant against</h3>
              ${resistanceList(item)}
            <h3>Weak against</h3>
              ${weakList(item)}
          </div>
        </div>
        <figure class="media-right">
          <figure class="image is-475x475">
            <img
              class=""
              src="${item.Images.Full}"
              alt="${item.Name}"
            />
          </figure>
        </figure>
      </article>
    </div>
    <div class="card-footer">
      <article class="media">
        <div class="media-content">
          <button id="add_deck" class="is-success button" tabindex="0">
            Add to the deck
          </button>
        </div>
      </article>
    </div>
    </div>
    </div>`,
    callbacks: {
      "add_deck" : { onclick : () => addPokemonDeck(item,etatCourant)} ,
    }
  };
  
}

/*******************************************************************************************
 *                                 @function abilitiesList                                 *
 * @returns la liste des abilites du pokemon selectionne                                   *  
 * @param item : pokemon selectionne                                                       *
 *******************************************************************************************/
function abilitiesList(pokemon){
  return `
    <ul>
      ${pokemon.Abilities.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `
}
/*******************************************************************************************
 *                                   @function typesList                                   *
 * @returns la liste des types du pokemon selectionne                                      *  
 * @param item : pokemon selectionne                                                       *
 *******************************************************************************************/
function typesList(pokemon){
  return `
    <ul>
      ${pokemon.Types.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `
}
/*******************************************************************************************
 *                                 @function resistanceList                                *
 * @returns la liste des resistance du pokemon selectionne                                  *  
 * @param item : pokemon selectionne                                                       *
 *******************************************************************************************/
function resistanceList(pokemon){
    const against = Object.entries(pokemon.Against);
    const resistance = against.filter(([key, value]) => value < 1);
    const resistantObject = Object.fromEntries(resistance);
    return `
      <ul>
        ${Object.keys(resistantObject).map((x) => `<li>${x}</li>`).join('')}
      </ul>
    `
}
/*******************************************************************************************
 *                                 @function weakList                                      *
 * @returns la liste des faiblesses du pokemon selectionne                                 *  
 * @param item : pokemon selectionne                                                       *
 *******************************************************************************************/
function weakList(pokemon){
  const weak = Object.entries(pokemon.Against);
  const weakness = weak.filter(([key, value]) => value > 1);
  const weakObject = Object.fromEntries(weakness);
  return `
    <ul>
      ${Object.keys(weakObject).map((x) => `<li>${x}</li>`).join('')}
    </ul>
  `
}















/*****************************************************************************************
 *                                    @function footerPage                               *
 * @returns la mise en page du bas de la page                                            *
 *****************************************************************************************/
function footerPage() {
  return {
    html : `

    </div>
  </section>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>Pokemon companion</strong> by DE CLERCQ Allan and DAVID-BOUDET Romain. 
      </p>
    </div>
  </footer>`
  };
}

