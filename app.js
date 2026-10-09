/* Mondial Literie Chinon — scripts légers (aucune dépendance) */
(function () {
  "use strict";

  /* ---------- Horaires et statut ouvert / fermé ---------- */
  // 0 = dimanche … 6 = samedi ; créneaux en heures décimales
  var HORAIRES = {
    0: [],
    1: [[9, 12], [14, 19]],
    2: [[9, 12], [14, 19]],
    3: [[9, 12], [14, 19]],
    4: [[9, 12], [14, 19]],
    5: [[9, 12], [14, 19]],
    6: [[9, 12], [14, 19]]
  };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function maintenantParis() {
    var parties = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var lire = function (type) { return parties.find(function (p) { return p.type === type; }).value; };
    var jours = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { jour: jours[lire("weekday")], minutes: parseInt(lire("hour"), 10) * 60 + parseInt(lire("minute"), 10) };
  }

  function statutMagasin() {
    var t = maintenantParis();
    var creneaux = HORAIRES[t.jour];
    for (var i = 0; i < creneaux.length; i++) {
      if (t.minutes >= creneaux[i][0] * 60 && t.minutes < creneaux[i][1] * 60) {
        return { ouvert: true, texte: "Ouvert, ferme à " + creneaux[i][1] + " h" };
      }
    }
    for (var d = 0; d < 8; d++) {
      var jour = (t.jour + d) % 7;
      var liste = HORAIRES[jour];
      for (var j = 0; j < liste.length; j++) {
        if (d > 0 || liste[j][0] * 60 > t.minutes) {
          var quand = d === 0 ? "" : d === 1 ? " demain" : " " + JOURS[jour];
          return { ouvert: false, texte: "Fermé, ouvre" + quand + " à " + liste[j][0] + " h" };
        }
      }
    }
    return { ouvert: false, texte: "Fermé" };
  }

  var statut = statutMagasin();
  document.querySelectorAll("[data-statut]").forEach(function (el) {
    el.textContent = statut.texte;
    el.classList.add(statut.ouvert ? "est-ouvert" : "est-ferme");
  });
  var aujourdhui = maintenantParis().jour;
  document.querySelectorAll(".horaires tr[data-jour]").forEach(function (tr) {
    if (parseInt(tr.getAttribute("data-jour"), 10) === aujourdhui) tr.classList.add("aujourdhui");
  });

  /* ---------- Menu mobile ---------- */
  var boutonMenu = document.querySelector(".entete__menu");
  var nav = document.getElementById("nav-principale");
  if (boutonMenu && nav) {
    boutonMenu.addEventListener("click", function () {
      var ouvert = nav.classList.toggle("est-ouvert");
      boutonMenu.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("est-ouvert");
        boutonMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Filtres du catalogue ---------- */
  var filtres = document.querySelectorAll(".filtre");
  if (filtres.length) {
    var cartes = document.querySelectorAll("[data-tags]");
    var compteur = document.querySelector("[data-compteur]");
    filtres.forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        var valeur = bouton.getAttribute("data-filtre");
        filtres.forEach(function (b) { b.setAttribute("aria-pressed", b === bouton ? "true" : "false"); });
        var visibles = 0;
        cartes.forEach(function (carte) {
          var tags = carte.getAttribute("data-tags").split(" ");
          var montrer = valeur === "tous" || tags.indexOf(valeur) !== -1;
          carte.hidden = !montrer;
          if (montrer) visibles++;
        });
        if (compteur) compteur.textContent = visibles + " matelas";
      });
    });
  }

  /* ---------- Choix de la taille (fiche produit) ---------- */
  var tailles = document.querySelectorAll('input[name="taille"]');
  if (tailles.length) {
    var majTaille = function () {
      var choisi = document.querySelector('input[name="taille"]:checked');
      if (!choisi) return;
      var prix = choisi.getAttribute("data-prix");
      document.querySelectorAll("[data-prix-affiche]").forEach(function (el) { el.textContent = prix; });
      document.querySelectorAll("[data-taille-affichee]").forEach(function (el) { el.textContent = choisi.value; });
      var lien = document.querySelector("[data-commander]");
      if (lien) lien.href = choisi.getAttribute("data-url");
    };
    tailles.forEach(function (t) { t.addEventListener("change", majTaille); });
    majTaille();
  }

  /* ---------- Guide « 3 questions » ---------- */
  var guide = document.getElementById("guide-form");
  if (guide) {
    var IMG = "https://www.mondial-literie.fr/";
    var MATELAS = {
      helios:  { nom: "Matelas Hélios",  lien: "matelas-helios.html", img: IMG + "79-home_default/helios.jpg",  prix: "dès 1 599 €", pourquoi: "Accueil souple et soutien ferme, ressorts ensachés" },
      pulsar:  { nom: "Matelas Pulsar",  lien: "matelas.html#pulsar",  img: IMG + "72-home_default/pulsar.jpg",  prix: "dès 1 099 €", pourquoi: "Ressorts 7 zones, soutien ferme" },
      theia:   { nom: "Matelas Theïa",   lien: "matelas.html#theia",   img: IMG + "73-home_default/theia.jpg",   prix: "dès 1 099 €", pourquoi: "Mémoire de forme et ressorts souples, accueil enveloppant" },
      alpha:   { nom: "Matelas Alpha",   lien: "matelas.html#alpha",   img: IMG + "126-home_default/alpha.jpg",  prix: "dès 999 €",   pourquoi: "Renfort lombaire ciblé" },
      venus:   { nom: "Matelas Vénus",   lien: "matelas.html#venus",   img: IMG + "88-home_default/matelas-venus.jpg",   prix: "dès 805 €", pourquoi: "Soutien tonique, en moelleux, medium ou ferme" },
      jupiter: { nom: "Matelas Jupiter", lien: "matelas.html#jupiter", img: IMG + "89-home_default/matelas-jupiter.jpg", prix: "dès 805 €", pourquoi: "Soutien moelleux, effet nuage" }
    };
    // Points attribués à chaque matelas selon les réponses
    var POINTS = {
      position: {
        dos:     { alpha: 2, helios: 2, pulsar: 1, venus: 1 },
        cote:    { theia: 3, jupiter: 2, helios: 1 },
        ventre:  { pulsar: 3, alpha: 1, venus: 1 },
        change:  { helios: 2, venus: 2, theia: 1 }
      },
      gene: {
        dos:      { alpha: 3, pulsar: 2, helios: 1 },
        chaleur:  { helios: 3, pulsar: 1, theia: 1, alpha: 1 },
        partenaire: { helios: 3, pulsar: 1, theia: 1 },
        confort:  { helios: 1, venus: 1, jupiter: 1, theia: 1 }
      },
      sensation: {
        ferme:      { pulsar: 3, alpha: 2, helios: 2, venus: 1 },
        equilibre:  { venus: 3, helios: 2, alpha: 1 },
        moelleux:   { theia: 3, jupiter: 3 }
      }
    };
    var CONSEILS = {
      cote: "Sur le côté, un accueil plus souple laisse l'épaule et la hanche s'enfoncer légèrement.",
      ventre: "Sur le ventre, un soutien ferme évite que le bassin ne s'affaisse.",
      dos: "Sur le dos, un bon maintien du creux des reins est la priorité.",
      change: "Si vous changez souvent de position, visez un confort polyvalent, ni trop ferme ni trop souple."
    };

    var resultat = document.getElementById("guide-resultat");
    var aide = guide.querySelector(".guide__aide");

    guide.addEventListener("submit", function (e) {
      e.preventDefault();
      var donnees = new FormData(guide);
      var reponses = { position: donnees.get("position"), gene: donnees.get("gene"), sensation: donnees.get("sensation") };
      if (!reponses.position || !reponses.gene || !reponses.sensation) {
        aide.textContent = "Répondez aux 3 questions pour voir nos conseils.";
        return;
      }
      var scores = {};
      Object.keys(reponses).forEach(function (q) {
        var pts = POINTS[q][reponses[q]] || {};
        Object.keys(pts).forEach(function (m) { scores[m] = (scores[m] || 0) + pts[m]; });
      });
      var classement = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; }).slice(0, 2);
      var cartes = classement.map(function (cle) {
        var m = MATELAS[cle];
        return '<a class="reco" href="' + m.lien + '"><img src="' + m.img + '" alt="" width="96" height="66" loading="lazy">' +
          '<div><strong>' + m.nom + '</strong><span>' + m.pourquoi + '</span><br><span>' + m.prix + '</span></div></a>';
      }).join("");
      resultat.innerHTML =
        '<div class="resultat">' +
          '<h3>Nos deux suggestions pour vous</h3>' +
          '<p class="intro">' + CONSEILS[reponses.position] + ' Le mieux reste de les comparer allongé : venez les essayer au magasin, un conseiller affinera avec vous.</p>' +
          '<div class="resultat__produits">' + cartes + '</div>' +
          '<div class="heros__actions">' +
            '<a class="btn btn--etoile" href="https://www.google.com/maps/search/?api=1&query=Mondial+Literie+Chinon&query_place_id=ChIJGQJpkeFB_UcRWI64xJ6NoHA" target="_blank" rel="noopener">Venir les essayer</a>' +
            '<a class="btn btn--contour" href="tel:+33765810869">Appeler le magasin</a>' +
          '</div>' +
        '</div>';
      aide.textContent = "";
      resultat.querySelector("h3").setAttribute("tabindex", "-1");
      resultat.querySelector("h3").focus();
    });
  }
})();
