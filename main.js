possibleSession = ["firstpractice","secondpractice","sprint","qualifying","thirdpractice","sprintqualifying"];
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
function getJSON(res) {
  const data = JSON.parse(res);
  var nb_race = 0;
  var Race = data.MRData.RaceTable.Races[nb_race];
  var raceDate = Race.date;

  console.log(new Date(Date.parse(raceDate)).getDate())
  while (
    new Date(Date.parse(raceDate)) <= new Date()
  ) {
    // tant que la date du gp est avant la date actuelle on continue
    Race = data.MRData.RaceTable.Races[nb_race];
    raceDate = Race.date;
    nb_race++;
  }

  while (data.MRData.RaceTable.Races[nb_race - 1] != undefined) {
    // tant qu'il y a des courses on cree des cartes

    Race = data.MRData.RaceTable.Races[nb_race - 1];
    creationCarte(Race);
    nb_race++;
  }
}
function creationCarte(jsonCourse) {
  var container = document.getElementById("container");

  // Create the card container
  var card = document.createElement("div");
  card.className = "card mb-4";

  // Create the card header with inline red color
  var cardHeader = document.createElement("div");
  cardHeader.className = "card-header text-white";
  cardHeader.style.backgroundColor = "#E10600"; // Formula 1 red color
  cardHeader.innerHTML = jsonCourse.raceName;
  card.appendChild(cardHeader);

  // Create the card body
  var cardBody = document.createElement("div");
  cardBody.className = "card-body";

  // Create the list container for sessions
  var listContainer = document.createElement("ul");
  listContainer.className = "list-group list-group-flush";

  // Array to store session elements
  var sessions = [];

  // Iterate over possible sessions and create session elements
  for (item in jsonCourse) {
    if (possibleSession.includes(item.toLowerCase())) {
      let session = {
        sessionName: item,
        date: jsonCourse[item].date,
        time: jsonCourse[item].time
      };
      let sessionElement = creationSession(session);
      sessions.push({ element: sessionElement, date: new Date(session.date + "T" + session.time) });
    }
  }

  // Create the race session element
  let raceSession = document.createElement("li");
  raceSession.className = "list-group-item";
  raceSession.innerHTML = creationChaine(
    "Race",
    jsonCourse.date,
    jsonCourse.time
  );
  sessions.push({ element: raceSession, date: new Date(jsonCourse.date + "T" + jsonCourse.time) });

  // Sort the sessions by date
  sessions.sort((a, b) => a.date - b.date);

  // Append the sorted session elements to the list container
  sessions.forEach(session => {
    listContainer.appendChild(session.element);
  });

  // Append the list container to the card body
  cardBody.appendChild(listContainer);

  // Append the card body to the card
  card.appendChild(cardBody);

  // Append the card to the container
  container.appendChild(card);
}

function creationSession(jsonSession) {
  let session = document.createElement("li");
  session.className = "list-group-item";
  session.innerHTML = creationChaine(
    jsonSession.sessionName,
    jsonSession.date,
    jsonSession.time
  );
  return session;
}
function creationChaine(nomSession, date, heure) {
  var dateComplete = new Date(date + "T" + heure);
  return nomSession + ": " + dateComplete.toLocaleString("fr-FR");
}

currentYear = new Date().getFullYear() 

ajax_get_request(getJSON, "https://api.jolpi.ca/ergast/f1/" + currentYear, true);


// PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));
  });
}