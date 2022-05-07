possibleSession = ["FirstPractice","SecondPractice","Sprint","Qualifying","ThirdPractice"];
function ajax_get_request(callback, url, async = true) {
  // Instanciation d'un objet XHR
  var xhr = new XMLHttpRequest();

  // Définition de la fonction à exécuter à chaque changement d'état
  xhr.onreadystatechange = function () {
    if (
      callback &&
      xhr.readyState == XMLHttpRequest.DONE &&
      (xhr.status == 200 || xhr.status == 0)
    ) {
      // Si une fonction callback est définie + que le serveur a fini son travail
      // + que le code d'état indique que tout s'est bien passé
      // => On appelle la fonction callback en passant en paramètre
      //		les données récupérées sous forme de texte brut
      callback(xhr.responseText);
    }
  };

  // Initialisation de l'objet puis envoi de la requête
  xhr.open("GET", url, async);
  xhr.send();
}

function getXML(res) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(res, "application/xml");
  var nb_race = 0;
  var Race = doc.getElementsByTagName("Race")[nb_race];
  var raceDate = Race.getElementsByTagName("Date")[0].childNodes[0].nodeValue;

  console.log(new Date(Date.parse(raceDate)).getDate())
  while (
    new Date(Date.parse(raceDate)) <= new Date()
  ) {
    // tant que la date du gp est avant la date actuelle on continue
    Race = doc.getElementsByTagName("Race")[nb_race];
    raceDate = Race.getElementsByTagName("Date")[0].childNodes[0].nodeValue;
    nb_race++;
  }
  
  while (doc.getElementsByTagName("Race")[nb_race - 1] != undefined) {
    // tant qu'il y a des courses on cree des cartes

    Race = doc.getElementsByTagName("Race")[nb_race - 1];
    creationCarte(Race);
    nb_race++;
  }
}
function creationCarte(xmlCourse) {
  var container = document.getElementById("container");

  var card = document.createElement("article");
  card.className += "GP card";

  var titleGP = document.createElement("h2");
  titleGP.className += "card-header";
  titleGP.id = "Name";
  titleGP.innerHTML =
    xmlCourse.getElementsByTagName("RaceName")[0].childNodes[0].nodeValue;
  card.appendChild(titleGP);

  var listContainer = document.createElement("ul");
  listContainer.className += "list-group list-group-flush";
  
  for(i=0;i < xmlCourse.childNodes.length;i++){ // Creation des session sauf course
    if(possibleSession.includes(xmlCourse.childNodes[i].nodeName)){
      
      creationSession(listContainer,xmlCourse.childNodes[i]);
    }
  }
  // Race
  session = document.createElement("li");
  session.className += "list-group-item";
  session.innerHTML = creationChaine(
    "Race",
    xmlCourse.getElementsByTagName("Date")[0].childNodes[0].nodeValue,
    xmlCourse.getElementsByTagName("Time")[0].childNodes[0].textContent
  );
  listContainer.appendChild(session);

  card.appendChild(listContainer);

  container.appendChild(card);
}
function creationSession(listContainer,xmlSession){
  let session = document.createElement("li");
  session.className += "list-group-item";
  session.innerHTML = creationChaine(
    xmlSession.nodeName,
    xmlSession.getElementsByTagName("Date")[0].childNodes[0].textContent,
    xmlSession.getElementsByTagName("Time")[0].childNodes[0].textContent
  );

  listContainer.appendChild(session);
}
function creationChaine(nomSession, date, heure) {
  var dateComplete = new Date(date + "T" + heure);
  return nomSession + ": " + dateComplete.toLocaleString("fr-FR");
}
ajax_get_request(getXML, "https://ergast.com/api/f1/current", true);


// PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));
  });
}