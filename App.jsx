import { useState, useRef, useEffect } from "react";

// ─── BLOOD DATA ───────────────────────────────────────────────────────────────
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const COMPAT = {
  "O-":  { give:["A+","A-","B+","B-","AB+","AB-","O+","O-"], get:["O-"] },
  "O+":  { give:["A+","B+","AB+","O+"],                      get:["O+","O-"] },
  "A-":  { give:["A+","A-","AB+","AB-"],                     get:["A-","O-"] },
  "A+":  { give:["A+","AB+"],                                get:["A+","A-","O+","O-"] },
  "B-":  { give:["B+","B-","AB+","AB-"],                     get:["B-","O-"] },
  "B+":  { give:["B+","AB+"],                                get:["B+","B-","O+","O-"] },
  "AB-": { give:["AB+","AB-"],                               get:["A-","B-","AB-","O-"] },
  "AB+": { give:["AB+"],                                     get:["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
};
const DONORS = [
  {id:1,name:"Marco R.", type:"O-", city:"Milano", dist:"1.2 km", ok:true},
  {id:2,name:"Sofia L.", type:"A+", city:"Milano", dist:"2.4 km", ok:true},
  {id:3,name:"Luca M.",  type:"B+", city:"Roma",   dist:"3.1 km", ok:false},
  {id:4,name:"Elena K.", type:"AB+",city:"Berlino",dist:"4.0 km", ok:true},
  {id:5,name:"James T.", type:"O+", city:"Londra", dist:"5.5 km", ok:true},
  {id:6,name:"Aisha N.", type:"A-", city:"Parigi", dist:"6.2 km", ok:true},
  {id:7,name:"Carlos M.",type:"B-", city:"Madrid", dist:"7.0 km", ok:false},
  {id:8,name:"Yuki T.",  type:"AB-",city:"Tokyo",  dist:"8.3 km", ok:true},
];

// ─── OSPEDALI ITALIANI ────────────────────────────────────────────────────────
const OSPEDALI = [
  {r:"Lombardia",   n:"IRCCS Ospedale San Raffaele",              c:"Milano",                   a:"Via Olgettina 60, 20132 Milano",                          t:"02 2643 1"},
  {r:"Lombardia",   n:"Istituto Clinico Humanitas",               c:"Rozzano (MI)",              a:"Via Alessandro Manzoni 56, 20089 Rozzano",                t:"02 8224 1"},
  {r:"Lombardia",   n:"Policlinico di Milano",                    c:"Milano",                   a:"Via Francesco Sforza 35, 20122 Milano",                   t:"02 5503 1"},
  {r:"Lombardia",   n:"Ospedale Niguarda",                        c:"Milano",                   a:"Piazza dell'Ospedale Maggiore 3, 20162 Milano",           t:"02 6444 1"},
  {r:"Lombardia",   n:"Ospedale Fatebenefratelli e Oftalmico",    c:"Milano",                   a:"Corso di Porta Nuova 23, 20121 Milano",                   t:"02 6363 1"},
  {r:"Lombardia",   n:"Istituto Europeo di Oncologia (IEO)",      c:"Milano",                   a:"Via Ripamonti 435, 20141 Milano",                         t:"02 5748 1"},
  {r:"Lombardia",   n:"Ospedale Luigi Sacco",                     c:"Milano",                   a:"Via G.B. Grassi 74, 20157 Milano",                        t:"02 3904 1"},
  {r:"Lombardia",   n:"IRCCS Ist. Neurologico Carlo Besta",       c:"Milano",                   a:"Via Celoria 11, 20133 Milano",                            t:"02 2394 1"},
  {r:"Lombardia",   n:"Istituto Ortopedico Galeazzi",             c:"Milano",                   a:"Via Riccardo Galeazzi 4, 20161 Milano",                   t:"02 6621 1"},
  {r:"Lombardia",   n:"Centro Cardiologico Monzino",              c:"Milano",                   a:"Via Carlo Parea 4, 20138 Milano",                         t:"02 5800 1"},
  {r:"Lombardia",   n:"Ospedale San Gerardo",                     c:"Monza",                    a:"Via G.B. Pergolesi 33, 20900 Monza",                      t:"039 233 1"},
  {r:"Lombardia",   n:"Policlinico San Donato",                   c:"San Donato Milanese",      a:"Via Rodolfo Morandi 30, 20097 San Donato Milanese",       t:"02 5277 41"},
  {r:"Lombardia",   n:"Ospedale di Circolo – ASST Sette Laghi",  c:"Varese",                   a:"Viale Luigi Borri 57, 21100 Varese",                      t:"0332 299 1"},
  {r:"Lombardia",   n:"Spedali Civili di Brescia",                c:"Brescia",                  a:"Piazza Spedali Civili 1, 25123 Brescia",                  t:"030 3995 1"},
  {r:"Lombardia",   n:"Ospedale Papa Giovanni XXIII",             c:"Bergamo",                  a:"Piazza OMS 1, 24127 Bergamo",                             t:"035 267 111"},
  {r:"Lombardia",   n:"ASST di Cremona",                          c:"Cremona",                  a:"Viale Concordia 1, 26100 Cremona",                        t:"0372 405 1"},
  {r:"Lombardia",   n:"Ospedale Carlo Poma",                      c:"Mantova",                  a:"Strada Lago Paiolo 10, 46100 Mantova",                    t:"0376 201 1"},
  {r:"Lazio",       n:"Policlinico Universitario A. Gemelli",     c:"Roma",                     a:"Largo Agostino Gemelli 8, 00168 Roma",                    t:"06 3015 1"},
  {r:"Lazio",       n:"Policlinico Umberto I",                    c:"Roma",                     a:"Viale del Policlinico 155, 00161 Roma",                   t:"06 4997 1"},
  {r:"Lazio",       n:"Ospedale Bambino Gesù",                    c:"Roma",                     a:"Piazza di Sant'Onofrio 4, 00165 Roma",                    t:"06 6859 1"},
  {r:"Lazio",       n:"Ospedale San Camillo-Forlanini",           c:"Roma",                     a:"Circonvallazione Gianicolense 87, 00152 Roma",            t:"06 5870 1"},
  {r:"Lazio",       n:"Istituto Nazionale Tumori Regina Elena",   c:"Roma",                     a:"Via Elio Chianesi 53, 00144 Roma",                        t:"06 5266 1"},
  {r:"Lazio",       n:"Campus Bio-Medico",                        c:"Roma",                     a:"Via Álvaro del Portillo 200, 00128 Roma",                 t:"06 2254 1"},
  {r:"Lazio",       n:"Ospedale San Giovanni Addolorata",         c:"Roma",                     a:"Via dell'Amba Aradam 9, 00184 Roma",                      t:"06 7705 1"},
  {r:"Lazio",       n:"Azienda Ospedaliera Sant'Andrea",          c:"Roma",                     a:"Via di Grottarossa 1035, 00189 Roma",                     t:"06 3377 1"},
  {r:"Lazio",       n:"Policlinico Tor Vergata",                  c:"Roma",                     a:"Viale Oxford 81, 00133 Roma",                             t:"06 2090 1"},
  {r:"Lazio",       n:"Ospedale Belcolle",                        c:"Viterbo",                  a:"Strada Sammartinese, 01100 Viterbo",                      t:"0761 339 1"},
  {r:"Veneto",      n:"Azienda Ospedaliera di Padova",            c:"Padova",                   a:"Via Giustiniani 2, 35128 Padova",                         t:"049 821 1111"},
  {r:"Veneto",      n:"AOU Integrata di Verona",                  c:"Verona",                   a:"Piazzale Aristide Stefani 1, 37126 Verona",               t:"045 812 1111"},
  {r:"Veneto",      n:"Ospedale dell'Angelo",                     c:"Mestre (VE)",              a:"Via Paccagnella 11, 30174 Mestre",                        t:"041 965 7111"},
  {r:"Veneto",      n:"Ospedale Sacro Cuore Don Calabria",        c:"Negrar (VR)",              a:"Via Don A. Sempreboni 5, 37024 Negrar",                   t:"045 601 1111"},
  {r:"Veneto",      n:"ULSS 2 Marca Trevigiana",                  c:"Treviso",                  a:"Piazza Ospedale 1, 31100 Treviso",                        t:"0422 322 111"},
  {r:"Veneto",      n:"Ospedale San Bortolo",                     c:"Vicenza",                  a:"Viale Ferdinando Rodolfi 37, 36100 Vicenza",              t:"0444 753 111"},
  {r:"Veneto",      n:"Ospedale di Bassano del Grappa",           c:"Bassano del Grappa",       a:"Viale dei Lotti 40, 36061 Bassano del Grappa",            t:"0424 888 111"},
  {r:"Toscana",     n:"AOU Careggi",                              c:"Firenze",                  a:"Largo Brambilla 3, 50134 Firenze",                        t:"055 794 1111"},
  {r:"Toscana",     n:"AOU Meyer",                                c:"Firenze",                  a:"Viale Gaetano Pieraccini 24, 50139 Firenze",              t:"055 566 1"},
  {r:"Toscana",     n:"AOU Pisana",                               c:"Pisa",                     a:"Via Roma 67, 56126 Pisa",                                 t:"050 992 111"},
  {r:"Toscana",     n:"AOU Senese Le Scotte",                     c:"Siena",                    a:"Viale Mario Bracci 16, 53100 Siena",                      t:"0577 585 111"},
  {r:"Toscana",     n:"Ospedale San Donato",                      c:"Arezzo",                   a:"Via Pietro Nenni 20, 52100 Arezzo",                       t:"0575 255 1"},
  {r:"Toscana",     n:"Misericordia e Dolce",                     c:"Prato",                    a:"Via Suor Niccolina Infermiera 20, 59100 Prato",           t:"0574 434 111"},
  {r:"Toscana",     n:"Ospedale Versilia",                        c:"Lido di Camaiore (LU)",    a:"Via Aurelia 335, 55043 Lido di Camaiore",                 t:"0584 6051"},
  {r:"Campania",    n:"AOU Federico II",                          c:"Napoli",                   a:"Via Sergio Pansini 5, 80131 Napoli",                      t:"081 746 1111"},
  {r:"Campania",    n:"AORN Ospedale dei Colli (Monaldi)",        c:"Napoli",                   a:"Via Leonardo Bianchi, 80131 Napoli",                      t:"081 706 1111"},
  {r:"Campania",    n:"AORN Cardarelli",                          c:"Napoli",                   a:"Via Antonio Cardarelli 9, 80131 Napoli",                  t:"081 747 1111"},
  {r:"Campania",    n:"Ospedale Santobono-Pausilipon",            c:"Napoli",                   a:"Via Mario Fiore 6, 80129 Napoli",                         t:"081 220 5111"},
  {r:"Campania",    n:"AOU San Giovanni di Dio e Ruggi",          c:"Salerno",                  a:"Via San Leonardo, 84131 Salerno",                         t:"089 671 1"},
  {r:"Campania",    n:"AORN Sant'Anna e San Sebastiano",          c:"Caserta",                  a:"Via Ferdinando Palasciano, 81100 Caserta",                t:"0823 232 111"},
  {r:"Sicilia",     n:"AOU Policlinico G. Rodolico – San Marco",  c:"Catania",                  a:"Via Santa Sofia 78, 95123 Catania",                       t:"095 378 1"},
  {r:"Sicilia",     n:"AOU Policlinico P. Giaccone",              c:"Palermo",                  a:"Via del Vespro 129, 90127 Palermo",                       t:"091 655 1"},
  {r:"Sicilia",     n:"ARNAS Civico Benfratelli",                 c:"Palermo",                  a:"Piazza Nicola Leotta 4, 90127 Palermo",                   t:"091 666 1111"},
  {r:"Sicilia",     n:"Ospedale Papardo",                         c:"Messina",                  a:"Contrada Papardo, 98158 Messina",                         t:"090 393 1"},
  {r:"Sicilia",     n:"AOU G. Martino",                           c:"Messina",                  a:"Via Consolare Valeria 1, 98124 Messina",                  t:"090 221 1"},
  {r:"Sicilia",     n:"Ospedale Giovanni Paolo II",               c:"Ragusa",                   a:"Contrada Consolida, 97100 Ragusa",                        t:"0932 600 1"},
  {r:"Sicilia",     n:"Ospedale Sant'Antonio Abate",              c:"Trapani",                  a:"Via Cosenza, 91100 Trapani",                              t:"0923 809 111"},
  {r:"Emilia-Romagna",n:"AOU di Bologna – Policlinico S. Orsola", c:"Bologna",                 a:"Via Giuseppe Massarenti 9, 40138 Bologna",                t:"051 636 1111"},
  {r:"Emilia-Romagna",n:"IRCCS Istituto Ortopedico Rizzoli",      c:"Bologna",                 a:"Via Pupilli 1, 40136 Bologna",                            t:"051 696 6111"},
  {r:"Emilia-Romagna",n:"AOU di Parma",                           c:"Parma",                   a:"Via Antonio Gramsci 14, 43126 Parma",                     t:"0521 702 111"},
  {r:"Emilia-Romagna",n:"AOU di Modena – Policlinico",            c:"Modena",                  a:"Via del Pozzo 71, 41124 Modena",                          t:"059 422 2111"},
  {r:"Emilia-Romagna",n:"Ospedale Infermi",                       c:"Rimini",                  a:"Viale Luigi Settembrini 2, 47923 Rimini",                 t:"0541 705 111"},
  {r:"Emilia-Romagna",n:"AOU di Ferrara – S. Anna",               c:"Ferrara",                 a:"Via Aldo Moro 8, 44124 Ferrara",                          t:"0532 236 1"},
  {r:"Emilia-Romagna",n:"Ospedale G.B. Morgagni–Pierantoni",      c:"Forlì",                   a:"Via Carlo Forlanini 34, 47121 Forlì",                     t:"0543 735 111"},
  {r:"Piemonte",    n:"AOU Città della Salute e della Scienza",   c:"Torino",                   a:"Corso Bramante 88, 10126 Torino",                         t:"011 633 1111"},
  {r:"Piemonte",    n:"Ospedale Mauriziano Umberto I",            c:"Torino",                   a:"Largo Turati 62, 10128 Torino",                           t:"011 508 1"},
  {r:"Piemonte",    n:"AOU Maggiore della Carità",                c:"Novara",                   a:"Corso Giuseppe Mazzini 18, 28100 Novara",                 t:"0321 373 1"},
  {r:"Piemonte",    n:"AO SS. Antonio e Biagio",                  c:"Alessandria",              a:"Via Venezia 16, 15121 Alessandria",                       t:"0131 206 1"},
  {r:"Piemonte",    n:"AO Santa Croce e Carle",                   c:"Cuneo",                    a:"Via Michele Coppino 26, 12100 Cuneo",                     t:"0171 641 1"},
  {r:"Piemonte",    n:"Ospedale degli Infermi",                   c:"Biella",                   a:"Via dei Ponderanesi 2, 13875 Biella",                     t:"015 350 4111"},
  {r:"Puglia",      n:"AOU Policlinico di Bari",                  c:"Bari",                     a:"Piazza Giulio Cesare 11, 70124 Bari",                     t:"080 559 1111"},
  {r:"Puglia",      n:"IRCCS Casa Sollievo della Sofferenza",     c:"San Giovanni Rotondo (FG)",a:"Viale Cappuccini 1, 71013 San Giovanni Rotondo",          t:"0882 410 1"},
  {r:"Puglia",      n:"Ospedale Perrino",                         c:"Brindisi",                 a:"Strada per Mesagne, 72100 Brindisi",                      t:"0831 537 111"},
  {r:"Puglia",      n:"Ospedale Vito Fazzi",                      c:"Lecce",                    a:"Piazza Filippo Muratore, 73100 Lecce",                    t:"0832 661 1"},
  {r:"Puglia",      n:"Ospedale SS. Annunziata",                  c:"Taranto",                  a:"Via Bruno 1, 74121 Taranto",                              t:"099 458 5111"},
  {r:"Puglia",      n:"Ospedali Riuniti di Foggia",               c:"Foggia",                   a:"Viale Luigi Pinto 1, 71122 Foggia",                       t:"0881 732 111"},
  {r:"Sardegna",    n:"AOU di Cagliari – Policlinico Duilio Casula",c:"Monserrato (CA)",        a:"Strada Statale 554, 09042 Monserrato",                    t:"070 6754 1"},
  {r:"Sardegna",    n:"Ospedale SS. Trinità",                     c:"Cagliari",                 a:"Via Romagna 16, 09127 Cagliari",                          t:"070 6095 1"},
  {r:"Sardegna",    n:"AOU di Sassari",                           c:"Sassari",                  a:"Viale San Pietro 43, 07100 Sassari",                      t:"079 228 1"},
  {r:"Sardegna",    n:"Presidio Ospedaliero S. Francesco",        c:"Nuoro",                    a:"Via Mannironi, 08100 Nuoro",                              t:"0784 240 1"},
  {r:"Calabria",    n:"AOU Mater Domini",                         c:"Catanzaro",                a:"Via Thomas Edison, 88100 Catanzaro",                      t:"0961 369 1"},
  {r:"Calabria",    n:"AO Pugliese-Ciaccio",                      c:"Catanzaro",                a:"Via Vinicio Cortese 25, 88100 Catanzaro",                 t:"0961 883 111"},
  {r:"Calabria",    n:"AO Bianchi-Melacrino-Morelli",             c:"Reggio Calabria",          a:"Via Melacrino, 89100 Reggio Calabria",                    t:"0965 397 1"},
  {r:"Calabria",    n:"Ospedale dell'Annunziata",                 c:"Cosenza",                  a:"Via Francesco Migliori, 87100 Cosenza",                   t:"0984 681 1"},
  {r:"Liguria",     n:"IRCCS Ospedale Policlinico San Martino",   c:"Genova",                   a:"Largo Rosanna Benzi 10, 16132 Genova",                    t:"010 555 1"},
  {r:"Liguria",     n:"Ospedale Santa Corona",                    c:"Pietra Ligure (SV)",       a:"Via XXV Aprile 38, 17027 Pietra Ligure",                  t:"019 623 1"},
  {r:"Liguria",     n:"Ospedale San Paolo",                       c:"Savona",                   a:"Via Genova 30, 17100 Savona",                             t:"019 840 4111"},
  {r:"Friuli-Venezia Giulia",n:"AOU di Trieste – Cattinara",     c:"Trieste",                  a:"Strada di Fiume 447, 34149 Trieste",                      t:"040 399 1"},
  {r:"Friuli-Venezia Giulia",n:"AOU di Udine",                   c:"Udine",                    a:"Piazzale Santa Maria della Misericordia 15, 33100 Udine", t:"0432 552 111"},
  {r:"Friuli-Venezia Giulia",n:"Ospedale S. Maria degli Angeli",  c:"Pordenone",               a:"Via Montereale 24, 33170 Pordenone",                      t:"0434 399 111"},
  {r:"Marche",      n:"AOU Ospedali Riuniti di Ancona",           c:"Ancona",                   a:"Via Conca 71, 60126 Ancona",                              t:"071 596 1"},
  {r:"Marche",      n:"Ospedale San Salvatore",                   c:"Pesaro",                   a:"Piazzale Cinelli 4, 61121 Pesaro",                        t:"0721 361 1"},
  {r:"Marche",      n:"Ospedale Madonna del Soccorso",            c:"San Benedetto del Tronto", a:"Via Lucrezia Romolo 10, 63074 San Benedetto del Tronto",  t:"0735 793 1"},
  {r:"Abruzzo",     n:"AOU di Chieti – SS. Annunziata",           c:"Chieti",                   a:"Via dei Vestini 31, 66100 Chieti",                        t:"0871 358 1"},
  {r:"Abruzzo",     n:"Ospedale Civile S. Spirito",               c:"Pescara",                  a:"Via Renato Paolini 47, 65124 Pescara",                    t:"085 425 1"},
  {r:"Abruzzo",     n:"Ospedale San Salvatore",                   c:"L'Aquila",                 a:"Via Lorenzo Natali, 67100 L'Aquila",                      t:"0862 368 1"},
  {r:"Trentino-Alto Adige",n:"Ospedale Santa Chiara",            c:"Trento",                   a:"Largo Medaglie d'Oro 9, 38122 Trento",                    t:"0461 903 111"},
  {r:"Trentino-Alto Adige",n:"Ospedale Centrale di Bolzano",     c:"Bolzano",                  a:"Via Lorenz Böhler 5, 39100 Bolzano",                      t:"0471 908 111"},
  {r:"Trentino-Alto Adige",n:"Ospedale di Rovereto",             c:"Rovereto (TN)",            a:"Via Paoli 1, 38068 Rovereto",                             t:"0464 453 111"},
  {r:"Umbria",      n:"AOU di Perugia",                           c:"Perugia",                  a:"Piazzale Giorgio Menghini 1, 06129 Perugia",              t:"075 578 1"},
  {r:"Umbria",      n:"Ospedale di Terni",                        c:"Terni",                    a:"Via Tristano di Joannuccio, 05100 Terni",                 t:"0744 205 111"},
  {r:"Basilicata",  n:"AOR San Carlo",                            c:"Potenza",                  a:"Via Potito Petrone, 85100 Potenza",                       t:"0971 612 111"},
  {r:"Basilicata",  n:"Ospedale Madonna delle Grazie",            c:"Matera",                   a:"Contrada Cattedra Ambulante, 75100 Matera",               t:"0835 253 1"},
  {r:"Molise",      n:"A.Or.Na. Cardarelli",                      c:"Campobasso",               a:"Contrada Tappino, 86100 Campobasso",                      t:"0874 409 1"},
  {r:"Valle d'Aosta",n:"Ospedale Regionale Umberto Parini",       c:"Aosta",                    a:"Viale Ginevra 3, 11100 Aosta",                            t:"0165 543 111"},
];

const REG_COLORS = {
  "Lombardia":"#3b82f6","Lazio":"#8b5cf6","Veneto":"#06b6d4","Toscana":"#10b981",
  "Campania":"#f59e0b","Sicilia":"#ef4444","Emilia-Romagna":"#ec4899","Piemonte":"#6366f1",
  "Puglia":"#14b8a6","Sardegna":"#f97316","Calabria":"#84cc16","Liguria":"#a78bfa",
  "Friuli-Venezia Giulia":"#22d3ee","Marche":"#34d399","Abruzzo":"#fbbf24",
  "Trentino-Alto Adige":"#60a5fa","Umbria":"#c084fc","Basilicata":"#fb923c",
  "Molise":"#4ade80","Valle d'Aosta":"#f472b6",
};
const REGIONI = ["Tutte",...Array.from(new Set(OSPEDALI.map(o=>o.r))).sort()];

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const LANGS = {en:"🇬🇧",it:"🇮🇹",es:"🇪🇸",fr:"🇫🇷",de:"🇩🇪"};
const T = {
  en:{home:"Home",reg:"Register",donors:"Donors",hospitals:"🏥 Italy",profile:"Profile",sos:"SOS",
      tagline:"Your blood type. Always with you.",
      h1a:"Save a life.",h1b:"Yours.",
      sub:"BloodLink connects patients, donors and hospitals in real time.",
      cta:"Register now →",
      fname:"Full name",fblood:"Blood type",fcity:"City",
      pname:"e.g. John Smith",pcity:"e.g. London",
      donorck:"I want to be a donor",donorsub:"My availability will be visible to hospitals in my area.",
      consentck:"Data processing consent",consentsub:"I consent to sharing my data with healthcare facilities in an emergency.",
      submit:"Create my profile →",
      qrlabel:"Emergency QR Code",qrhint:"Show this to rescuers.\nThey access your vital data in 3 seconds.",
      ctitle:"Transfusion compatibility",cget:"Can receive from:",cgive:"Can donate to:",
      dtag:"Registered donor",
      dtitle:"Donor Network",dsub:"Filter by blood type or find compatible donors",
      dall:"All",davail:"Available",dunavail:"Unavailable",dnone:"No compatible donors found.",
      dshow:"Showing compatible donors for",
      htitle:"Italian Hospitals",hsub:"110+ hospitals across 20 regions — real data",
      hsearch:"Search hospital, city or region…",hreg:"All Regions",
      haddr:"Address",hphone:"Phone",hmaps:"Open in Maps",h118:"Call 118",
      sostitle:"SOS MEDICAL",sosdesc:"Sending your location and medical profile to emergency services…",
      sossent:"🚨 SOS Sent! Emergency services alerted.",soscancel:"Cancel",
      stats:[["2.4M+","Registered users"],["190+","Active countries"],["14K+","Lives saved"],["0","Cost to use"]],
      feats:[["🪪","Medical Profile","Blood type and emergency contacts always available."],["📲","QR Code","Doctors scan your code for instant vital data."],["📍","Donor Network","Find compatible donors nearby in seconds."],["🔒","Full Privacy","Granular control on data sharing."],["🏥","Italian Hospitals","110+ hospitals with real addresses."],["🆘","Medical SOS","Send your profile in one tap."]]},
  it:{home:"Home",reg:"Registrati",donors:"Donatori",hospitals:"🏥 Italia",profile:"Profilo",sos:"SOS",
      tagline:"Il tuo gruppo sanguigno. Sempre con te.",
      h1a:"Salva una vita.",h1b:"La tua.",
      sub:"BloodLink connette pazienti, donatori e ospedali in tempo reale.",
      cta:"Registrati ora →",
      fname:"Nome completo",fblood:"Gruppo sanguigno",fcity:"Città",
      pname:"es. Marco Rossi",pcity:"es. Milano",
      donorck:"Voglio essere donatore",donorsub:"La mia disponibilità sarà visibile agli ospedali.",
      consentck:"Consenso al trattamento dati",consentsub:"Acconsento alla condivisione dei miei dati in emergenza.",
      submit:"Crea il mio profilo →",
      qrlabel:"QR Code di emergenza",qrhint:"Mostra questo ai soccorritori.\nAccedono ai tuoi dati in 3 secondi.",
      ctitle:"Compatibilità trasfusionale",cget:"Puoi ricevere da:",cgive:"Puoi donare a:",
      dtag:"Donatore registrato",
      dtitle:"Rete Donatori",dsub:"Filtra per gruppo sanguigno o cerca donatori compatibili",
      dall:"Tutti",davail:"Disponibile",dunavail:"Non disponibile",dnone:"Nessun donatore compatibile trovato.",
      dshow:"Donatori compatibili per",
      htitle:"Ospedali d'Italia",hsub:"110+ strutture in 20 regioni — dati reali",
      hsearch:"Cerca ospedale, città o regione…",hreg:"Tutte le Regioni",
      haddr:"Indirizzo",hphone:"Centralino",hmaps:"Apri su Maps",h118:"Chiama 118",
      sostitle:"SOS MEDICO",sosdesc:"Invio posizione e profilo medico ai servizi di emergenza…",
      sossent:"🚨 SOS Inviato! Servizi di emergenza allertati.",soscancel:"Annulla",
      stats:[["2.4M+","Utenti registrati"],["190+","Paesi attivi"],["14K+","Vite salvate"],["0","Costo di utilizzo"]],
      feats:[["🪪","Profilo Medico","Gruppo sanguigno e contatti d'emergenza sempre disponibili."],["📲","QR Code","Il medico scansiona il codice per i dati vitali."],["📍","Rete Donatori","Trova donatori compatibili in pochi secondi."],["🔒","Privacy Totale","Controllo granulare sui dati."],["🏥","Ospedali Italia","110+ ospedali con indirizzi reali."],["🆘","SOS Medico","Invia il tuo profilo con un tap."]]},
  es:{home:"Inicio",reg:"Registrarse",donors:"Donantes",hospitals:"🏥 Italia",profile:"Perfil",sos:"SOS",
      tagline:"Tu grupo sanguíneo. Siempre contigo.",h1a:"Salva una vida.",h1b:"La tuya.",
      sub:"BloodLink conecta pacientes, donantes y hospitales en tiempo real.",cta:"Regístrate →",
      fname:"Nombre",fblood:"Grupo sanguíneo",fcity:"Ciudad",pname:"ej. Carlos",pcity:"ej. Madrid",
      donorck:"Quiero ser donante",donorsub:"Mi disponibilidad será visible a los hospitales.",
      consentck:"Consentimiento",consentsub:"Consiento compartir mis datos en emergencias.",submit:"Crear perfil →",
      qrlabel:"QR de emergencia",qrhint:"Muestra esto a los socorristas.",ctitle:"Compatibilidad",
      cget:"Puede recibir de:",cgive:"Puede donar a:",dtag:"Donante registrado",
      dtitle:"Red de Donantes",dsub:"Filtra por grupo sanguíneo",dall:"Todos",davail:"Disponible",
      dunavail:"No disponible",dnone:"No hay donantes.",dshow:"Donantes para",
      htitle:"Hospitales de Italia",hsub:"110+ hospitales en 20 regiones",hsearch:"Buscar…",hreg:"Todas",
      haddr:"Dirección",hphone:"Teléfono",hmaps:"Ver en Maps",h118:"Llamar 118",
      sostitle:"SOS MÉDICO",sosdesc:"Enviando ubicación…",sossent:"🚨 SOS Enviado!",soscancel:"Cancelar",
      stats:[["2.4M+","Usuarios"],["190+","Países"],["14K+","Vidas"],["0","Gratis"]],
      feats:[["🪪","Perfil",""],["📲","QR",""],["📍","Donantes",""],["🔒","Privacidad",""],["🏥","Hospitales",""],["🆘","SOS",""]]},
  fr:{home:"Accueil",reg:"S'inscrire",donors:"Donneurs",hospitals:"🏥 Italie",profile:"Profil",sos:"SOS",
      tagline:"Votre groupe sanguin. Toujours avec vous.",h1a:"Sauvez une vie.",h1b:"La vôtre.",
      sub:"BloodLink connecte patients, donneurs et hôpitaux en temps réel.",cta:"S'inscrire →",
      fname:"Nom",fblood:"Groupe sanguin",fcity:"Ville",pname:"ex. Jean",pcity:"ex. Paris",
      donorck:"Je veux être donneur",donorsub:"Ma disponibilité sera visible aux hôpitaux.",
      consentck:"Consentement",consentsub:"Je consens au partage de mes données en urgence.",submit:"Créer mon profil →",
      qrlabel:"QR d'urgence",qrhint:"Montrez ceci aux secouristes.",ctitle:"Compatibilité",
      cget:"Peut recevoir de:",cgive:"Peut donner à:",dtag:"Donneur enregistré",
      dtitle:"Réseau",dsub:"Filtrer par groupe sanguin",dall:"Tous",davail:"Disponible",
      dunavail:"Non disponible",dnone:"Aucun donneur.",dshow:"Donneurs pour",
      htitle:"Hôpitaux d'Italie",hsub:"110+ hôpitaux dans 20 régions",hsearch:"Rechercher…",hreg:"Toutes",
      haddr:"Adresse",hphone:"Téléphone",hmaps:"Voir sur Maps",h118:"Appeler 118",
      sostitle:"SOS MÉDICAL",sosdesc:"Envoi localisation…",sossent:"🚨 SOS Envoyé!",soscancel:"Annuler",
      stats:[["2.4M+","Utilisateurs"],["190+","Pays"],["14K+","Vies"],["0","Gratuit"]],
      feats:[["🪪","Profil",""],["📲","QR",""],["📍","Donneurs",""],["🔒","Vie privée",""],["🏥","Hôpitaux",""],["🆘","SOS",""]]},
  de:{home:"Start",reg:"Registrieren",donors:"Spender",hospitals:"🏥 Italien",profile:"Profil",sos:"SOS",
      tagline:"Deine Blutgruppe. Immer dabei.",h1a:"Rette ein Leben.",h1b:"Dein eigenes.",
      sub:"BloodLink verbindet Patienten, Spender und Krankenhäuser in Echtzeit.",cta:"Registrieren →",
      fname:"Name",fblood:"Blutgruppe",fcity:"Stadt",pname:"z.B. Max",pcity:"z.B. Berlin",
      donorck:"Ich möchte Spender sein",donorsub:"Meine Verfügbarkeit wird für Krankenhäuser sichtbar.",
      consentck:"Datenschutz",consentsub:"Ich stimme der Datenweitergabe im Notfall zu.",submit:"Profil erstellen →",
      qrlabel:"Notfall-QR-Code",qrhint:"Zeigen Sie dies den Rettungskräften.",ctitle:"Kompatibilität",
      cget:"Kann empfangen von:",cgive:"Kann spenden an:",dtag:"Registrierter Spender",
      dtitle:"Spendernetz",dsub:"Nach Blutgruppe filtern",dall:"Alle",davail:"Verfügbar",
      dunavail:"Nicht verfügbar",dnone:"Keine Spender gefunden.",dshow:"Spender für",
      htitle:"Krankenhäuser Italiens",hsub:"110+ Krankenhäuser in 20 Regionen",hsearch:"Suchen…",hreg:"Alle",
      haddr:"Adresse",hphone:"Telefon",hmaps:"In Maps öffnen",h118:"118 anrufen",
      sostitle:"MEDIZINISCHER SOS",sosdesc:"Standort wird gesendet…",sossent:"🚨 SOS Gesendet!",soscancel:"Abbrechen",
      stats:[["2.4M+","Nutzer"],["190+","Länder"],["14K+","Leben"],["0","Kostenlos"]],
      feats:[["🪪","Profil",""],["📲","QR",""],["📍","Spender",""],["🔒","Datenschutz",""],["🏥","Krankenhäuser",""],["🆘","SOS",""]]},
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function QRCanvas({value,size=150,dark}){
  const ref=useRef(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d"),cell=size/21;
    ctx.fillStyle=dark?"#1e293b":"#fff";ctx.fillRect(0,0,size,size);
    const seed=value.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const rnd=i=>((seed*(i+7)*2654435761)>>>0)%2;
    ctx.fillStyle=dark?"#f1f5f9":"#0f172a";
    [[0,0],[0,14],[14,0]].forEach(([r,c])=>{
      ctx.fillRect(c*cell,r*cell,7*cell,7*cell);
      ctx.fillStyle=dark?"#1e293b":"#fff";ctx.fillRect((c+1)*cell,(r+1)*cell,5*cell,5*cell);
      ctx.fillStyle=dark?"#f1f5f9":"#0f172a";ctx.fillRect((c+2)*cell,(r+2)*cell,3*cell,3*cell);
    });
    for(let r=0;r<21;r++)for(let c=0;c<21;c++){
      if(!((r<8&&c<8)||(r<8&&c>12)||(r>12&&c<8))&&rnd(r*21+c))
        ctx.fillRect(c*cell,r*cell,cell,cell);
    }
  },[value,size,dark]);
  return <canvas ref={ref} width={size} height={size} style={{borderRadius:8}}/>;
}

function Pulse(){
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
      {[80,60].map((s,i)=>(
        <div key={s} style={{position:"absolute",width:s,height:s,borderRadius:"50%",
          border:"2px solid #ef4444",opacity:i?.5:.3,animation:`blp 2s ease-out infinite ${i*.5}s`}}/>
      ))}
      <div style={{width:44,height:44,borderRadius:"50%",
        background:"linear-gradient(135deg,#ef4444,#b91c1c)",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 0 20px rgba(239,68,68,.4)"}}>
        <span style={{color:"#fff",fontSize:20}}>🩸</span>
      </div>
    </div>
  );
}

function SOSModal({t,dark,onClose}){
  const [phase,setPhase]=useState("confirm");
  const [cnt,setCnt]=useState(3);
  useEffect(()=>{
    if(phase!=="sending")return;
    if(cnt===0){setPhase("sent");return;}
    const id=setTimeout(()=>setCnt(c=>c-1),1000);
    return()=>clearTimeout(id);
  },[phase,cnt]);
  const bg=dark?"rgba(8,8,14,.98)":"rgba(255,255,255,.98)";
  const tx=dark?"#f1f5f9":"#0f172a";const sub=dark?"#94a3b8":"#64748b";
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,.8)",backdropFilter:"blur(12px)"}}>
      <div style={{background:bg,color:tx,borderRadius:24,padding:"40px 36px",maxWidth:400,
        width:"90%",textAlign:"center",border:"2px solid rgba(239,68,68,.45)",
        boxShadow:"0 0 60px rgba(239,68,68,.3)"}}>
        {phase==="confirm"&&<>
          <div style={{fontSize:64,marginBottom:16}}>🆘</div>
          <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>{t.sostitle}</div>
          <div style={{fontSize:14,color:sub,marginBottom:28,lineHeight:1.7}}>{t.sosdesc}</div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,cursor:"pointer",
              background:"transparent",border:`1px solid ${dark?"rgba(255,255,255,.15)":"rgba(0,0,0,.12)"}`,
              color:sub,fontFamily:"inherit",fontSize:14}}>{t.soscancel}</button>
            <button onClick={()=>setPhase("sending")} style={{flex:2,padding:"12px",borderRadius:12,
              background:"linear-gradient(135deg,#ef4444,#b91c1c)",border:"none",color:"#fff",
              cursor:"pointer",fontFamily:"inherit",fontSize:15,fontWeight:700}}>
              {t.sos} 🚨</button>
          </div>
        </>}
        {phase==="sending"&&<>
          <div style={{fontSize:64,marginBottom:16}}>📡</div>
          <div style={{fontSize:32,fontWeight:700,color:"#ef4444",marginBottom:8}}>{cnt}</div>
          <div style={{fontSize:14,color:sub,marginBottom:20}}>{t.sosdesc}</div>
          <div style={{height:4,background:"rgba(239,68,68,.2)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",background:"#ef4444",width:`${((3-cnt)/3)*100}%`,
              transition:"width 1s linear",borderRadius:99}}/>
          </div>
        </>}
        {phase==="sent"&&<>
          <div style={{fontSize:64,marginBottom:16}}>✅</div>
          <div style={{fontSize:16,fontWeight:600,color:"#4ade80",lineHeight:1.7}}>{t.sossent}</div>
          <button onClick={onClose} style={{marginTop:24,padding:"12px 28px",borderRadius:12,
            background:"rgba(74,222,128,.15)",border:"1px solid rgba(74,222,128,.3)",
            color:"#4ade80",cursor:"pointer",fontFamily:"inherit",fontSize:14}}>OK</button>
        </>}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function BloodLink(){
  const [view,setView]      = useState("home");
  const [dark,setDark]      = useState(true);
  const [lang,setLang]      = useState("it");
  const [langMenu,setLangMenu]=useState(false);
  const [showSOS,setShowSOS]= useState(false);
  const [profile,setProfile]= useState(null);
  const [form,setForm]      = useState({name:"",bt:"",city:"",donor:false,consent:false});
  const [dFilter,setDFilter]= useState("all");
  const [hSearch,setHSearch]= useState("");
  const [hReg,setHReg]      = useState("Tutte");
  const [expanded,setExpanded]=useState(null);
  const t=T[lang];

  const C=dark?{
    bg:"#0a0a0f",surf:"rgba(255,255,255,.04)",border:"rgba(255,255,255,.08)",
    text:"#f1f5f9",sub:"#64748b",muted:"#475569",
    nav:"rgba(10,10,15,.92)",inp:"rgba(255,255,255,.06)",card:"rgba(255,255,255,.06)",
  }:{
    bg:"#f4f6fb",surf:"rgba(0,0,0,.03)",border:"rgba(0,0,0,.08)",
    text:"#0f172a",sub:"#475569",muted:"#94a3b8",
    nav:"rgba(244,246,251,.94)",inp:"rgba(0,0,0,.05)",card:"rgba(0,0,0,.04)",
  };

  const nb=active=>({padding:"7px 13px",borderRadius:100,border:"none",cursor:"pointer",
    fontSize:12,fontFamily:"inherit",transition:"all .2s",
    background:active?"rgba(239,68,68,.15)":"transparent",
    color:active?"#f87171":C.sub});
  const lbl={display:"block",fontSize:11,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8};
  const inp={width:"100%",padding:"13px 16px",background:C.inp,border:`1px solid ${C.border}`,
    borderRadius:12,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"};
  const cardS={background:C.surf,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 24px"};

  const doReg=()=>{
    if(!form.name||!form.bt||!form.city||!form.consent)return;
    setProfile({...form,qr:`BL:${form.name}:${form.bt}:${form.city}`});
    setView("profile");
  };

  const filtDonors=dFilter==="all"?DONORS:DONORS.filter(d=>COMPAT[dFilter]?.get.includes(d.type));

  const filtHosp=OSPEDALI.filter(o=>{
    const q=hSearch.toLowerCase();
    return(o.n.toLowerCase().includes(q)||o.c.toLowerCase().includes(q)||
           o.r.toLowerCase().includes(q)||o.a.toLowerCase().includes(q))&&
           (hReg==="Tutte"||o.r===hReg);
  });
  const grouped=filtHosp.reduce((acc,o)=>{
    if(!acc[o.r])acc[o.r]=[];
    acc[o.r].push(o);return acc;
  },{});

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,
      fontFamily:"'Georgia','Times New Roman',serif",position:"relative",overflowX:"hidden"}}>
      <style>{`
        @keyframes blp{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}
        @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sk{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
        *{margin:0;padding:0;box-sizing:border-box}button:hover{opacity:.84}
        input:focus{border-color:rgba(239,68,68,.5)!important}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(239,68,68,.3);border-radius:99px}
      `}</style>

      <div style={{position:"fixed",width:600,height:600,borderRadius:"50%",
        background:dark?"radial-gradient(circle,rgba(185,28,28,.1) 0%,transparent 70%)":"radial-gradient(circle,rgba(239,68,68,.06) 0%,transparent 70%)",
        top:-250,right:-250,pointerEvents:"none",zIndex:0}}/>

      {showSOS&&<SOSModal t={t} dark={dark} onClose={()=>setShowSOS(false)}/>}

      {/* ── NAV ── */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"13px 22px",borderBottom:`1px solid ${C.border}`,
        position:"sticky",top:0,zIndex:100,backdropFilter:"blur(16px)",background:C.nav,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setView("home")}>
          <Pulse/>
          <span style={{fontSize:19,fontWeight:700,letterSpacing:"-.5px",
            background:"linear-gradient(90deg,#f87171,#ef4444)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>BloodLink</span>
        </div>
        <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}}>
          {[["home",t.home],["register",t.reg],["donors",t.donors],["hospitals",t.hospitals]].map(([id,lb])=>(
            <button key={id} style={nb(view===id||(view==="profile"&&id==="register"))} onClick={()=>setView(id)}>{lb}</button>
          ))}
          {profile&&<button style={nb(view==="profile")} onClick={()=>setView("profile")}>👤 {t.profile}</button>}
          <button onClick={()=>setShowSOS(true)} style={{
            padding:"7px 14px",borderRadius:100,border:"none",cursor:"pointer",
            fontSize:12,fontWeight:700,fontFamily:"inherit",
            background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",
            boxShadow:"0 0 14px rgba(239,68,68,.4)",animation:"sk 3.5s ease-in-out infinite"}}>
            🆘 {t.sos}
          </button>
          <button onClick={()=>setDark(d=>!d)} style={{width:33,height:33,borderRadius:"50%",
            border:`1px solid ${C.border}`,background:C.surf,cursor:"pointer",fontSize:14,
            display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?"☀️":"🌙"}</button>
          <div style={{position:"relative"}}>
            <button onClick={()=>setLangMenu(m=>!m)} style={{
              padding:"6px 11px",borderRadius:100,border:`1px solid ${C.border}`,
              background:C.surf,cursor:"pointer",fontSize:13,fontFamily:"inherit",
              color:C.text,display:"flex",alignItems:"center",gap:5}}>
              {LANGS[lang]} <span style={{fontSize:10,color:C.sub}}>{lang.toUpperCase()} ▾</span>
            </button>
            {langMenu&&(
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,
                background:dark?"#1a1f2e":"#fff",border:`1px solid ${C.border}`,
                borderRadius:14,padding:6,zIndex:300,minWidth:120,
                boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
                {Object.entries(LANGS).map(([code,flag])=>(
                  <button key={code} onClick={()=>{setLang(code);setLangMenu(false);}} style={{
                    display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 12px",
                    borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",
                    background:lang===code?"rgba(239,68,68,.1)":"transparent",
                    color:lang===code?"#f87171":C.text,fontSize:13}}>
                    <span>{flag}</span><span>{code.toUpperCase()}</span>
                    {lang===code&&<span style={{marginLeft:"auto",color:"#f87171",fontSize:11}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{position:"relative",zIndex:1,maxWidth:980,margin:"0 auto",padding:"0 18px 80px"}}>

        {/* HOME */}
        {view==="home"&&(
          <div style={{animation:"fu .5s ease"}}>
            <div style={{textAlign:"center",paddingTop:64,paddingBottom:48}}>
              <span style={{fontSize:11,letterSpacing:4,color:"#ef4444",textTransform:"uppercase",marginBottom:20,display:"block"}}>{t.tagline}</span>
              <h1 style={{fontSize:"clamp(34px,5.5vw,64px)",fontWeight:700,lineHeight:1.1,marginBottom:16,letterSpacing:"-2px"}}>
                {t.h1a}<br/><span style={{color:"#ef4444"}}>{t.h1b}</span>
              </h1>
              <p style={{fontSize:16,color:C.sub,maxWidth:460,margin:"0 auto 32px",lineHeight:1.8,fontStyle:"italic"}}>{t.sub}</p>
              <button onClick={()=>setView("register")} style={{
                display:"inline-flex",alignItems:"center",gap:10,padding:"14px 30px",borderRadius:100,
                background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",border:"none",
                cursor:"pointer",fontSize:15,fontFamily:"inherit",fontWeight:600,
                boxShadow:"0 8px 32px rgba(239,68,68,.3)"}}>{t.cta}</button>
            </div>
            <div style={{display:"flex",gap:1,background:C.surf,borderRadius:20,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:40}}>
              {t.stats.map(([n,l])=>(
                <div key={l} style={{flex:1,padding:"22px 10px",textAlign:"center",borderRight:`1px solid ${C.border}`}}>
                  <span style={{fontSize:26,fontWeight:700,color:"#f87171",display:"block",letterSpacing:"-1px"}}>{n}</span>
                  <span style={{fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginTop:4,display:"block"}}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {t.feats.map(([icon,title,desc])=>(
                <div key={title} style={{padding:"20px 16px",borderRadius:14,background:C.surf,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:22,marginBottom:10,display:"block"}}>{icon}</span>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:5,color:C.text}}>{title}</div>
                  <div style={{fontSize:11,color:C.sub,lineHeight:1.7}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REGISTER */}
        {view==="register"&&(
          <div style={{animation:"fu .4s ease"}}>
            <div style={{maxWidth:480,margin:"46px auto 0",background:C.surf,
              border:`1px solid ${C.border}`,borderRadius:24,padding:"30px 34px"}}>
              <div style={{fontSize:22,fontWeight:700,marginBottom:4,letterSpacing:"-.5px"}}>
                {t.fname.includes("Nome")||t.fname.includes("Full")||t.fname.includes("Nombre")||t.fname.includes("Nom")||t.fname.includes("Name")?"Crea il tuo profilo":t.fname}</div>
              <div style={{fontSize:13,color:C.sub,marginBottom:22}}>
                {lang==="it"?"Meno di 2 minuti.":lang==="en"?"Takes less than 2 minutes.":lang==="es"?"Menos de 2 minutos.":lang==="fr"?"Moins de 2 minutes.":"Weniger als 2 Minuten."}</div>
              <label style={lbl}>{t.fname}</label>
              <input style={{...inp,marginBottom:16}} placeholder={t.pname}
                value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              <label style={lbl}>{t.fblood}</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:16}}>
                {BLOOD_TYPES.map(tp=>(
                  <button key={tp} onClick={()=>setForm({...form,bt:tp})} style={{
                    padding:"10px 4px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",
                    background:form.bt===tp?"rgba(239,68,68,.2)":C.inp,
                    color:form.bt===tp?"#f87171":C.sub,
                    border:form.bt===tp?"1px solid rgba(239,68,68,.4)":`1px solid ${C.border}`,
                    fontSize:14,fontWeight:700,transition:"all .15s"}}>{tp}</button>
                ))}
              </div>
              <label style={lbl}>{t.fcity}</label>
              <input style={{...inp,marginBottom:18}} placeholder={t.pcity}
                value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
              {[[form.donor,e=>setForm({...form,donor:e.target.checked}),t.donorck,t.donorsub],
                [form.consent,e=>setForm({...form,consent:e.target.checked}),t.consentck,t.consentsub]].map(([chk,fn,lb,sb])=>(
                <div key={lb} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:9,
                  padding:"11px 13px",background:C.inp,borderRadius:11}}>
                  <input type="checkbox" checked={chk} onChange={fn}
                    style={{width:16,height:16,accentColor:"#ef4444",marginTop:2,cursor:"pointer",flexShrink:0}}/>
                  <span style={{fontSize:12,color:C.sub,lineHeight:1.6}}>
                    <strong style={{color:C.text}}>{lb}</strong><br/>{sb}
                  </span>
                </div>
              ))}
              <button onClick={doReg} disabled={!form.name||!form.bt||!form.city||!form.consent}
                style={{width:"100%",padding:"13px",marginTop:6,border:"none",borderRadius:11,
                  fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .2s",
                  background:(!form.name||!form.bt||!form.city||!form.consent)
                    ?"rgba(239,68,68,.2)":"linear-gradient(135deg,#ef4444,#b91c1c)",
                  color:(!form.name||!form.bt||!form.city||!form.consent)?C.muted:"#fff",
                  boxShadow:(!form.name||!form.bt||!form.city||!form.consent)?"none":"0 4px 20px rgba(239,68,68,.25)"
                }}>{t.submit}</button>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {view==="profile"&&profile&&(
          <div style={{animation:"fu .4s ease"}}>
            <div style={{maxWidth:540,margin:"46px auto 0"}}>
              <div style={{background:"linear-gradient(135deg,rgba(185,28,28,.18),rgba(239,68,68,.05))",
                border:"1px solid rgba(239,68,68,.22)",borderRadius:20,
                padding:"26px 30px",display:"flex",alignItems:"center",flexWrap:"wrap",gap:14,marginBottom:12}}>
                <div style={{width:68,height:68,borderRadius:"50%",
                  background:"linear-gradient(135deg,#ef4444,#b91c1c)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:19,fontWeight:800,color:"#fff",
                  boxShadow:"0 0 26px rgba(239,68,68,.35)",letterSpacing:"-1px"}}>{profile.bt}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:20,fontWeight:700,letterSpacing:"-.5px",marginBottom:2}}>{profile.name}</div>
                  <div style={{fontSize:12,color:C.sub}}>📍 {profile.city}</div>
                  {profile.donor&&(
                    <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",
                      borderRadius:100,marginTop:7,background:"rgba(34,197,94,.1)",
                      border:"1px solid rgba(34,197,94,.25)",color:"#4ade80",fontSize:11}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
                      {t.dtag}
                    </div>
                  )}
                </div>
                <button onClick={()=>setShowSOS(true)} style={{
                  padding:"9px 14px",borderRadius:10,border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",
                  fontSize:11,fontWeight:700,fontFamily:"inherit"}}>🆘 {t.sos}</button>
              </div>
              <div style={{...cardS,display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:12}}>
                <span style={{fontSize:10,letterSpacing:3,color:C.muted,textTransform:"uppercase"}}>{t.qrlabel}</span>
                <QRCanvas value={profile.qr} size={148} dark={dark}/>
                <span style={{fontSize:11,color:C.sub,textAlign:"center",lineHeight:1.7}}>{t.qrhint}</span>
              </div>
              <div style={cardS}>
                <div style={{fontSize:10,letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:12}}>{t.ctitle}</div>
                <div style={{fontSize:11,color:C.sub,marginBottom:7}}>{t.cget}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:11}}>
                  {COMPAT[profile.bt]?.get.map(tp=>(
                    <span key={tp} style={{padding:"3px 10px",borderRadius:100,fontSize:12,fontWeight:700,
                      background:"rgba(34,197,94,.1)",color:"#4ade80",border:"1px solid rgba(34,197,94,.22)"}}>{tp}</span>
                  ))}
                </div>
                <div style={{fontSize:11,color:C.sub,marginBottom:7}}>{t.cgive}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {COMPAT[profile.bt]?.give.map(tp=>(
                    <span key={tp} style={{padding:"3px 10px",borderRadius:100,fontSize:12,fontWeight:700,
                      background:"rgba(239,68,68,.1)",color:"#f87171",border:"1px solid rgba(239,68,68,.22)"}}>{tp}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DONORS */}
        {view==="donors"&&(
          <div style={{paddingTop:42,animation:"fu .4s ease"}}>
            <div style={{fontSize:24,fontWeight:700,letterSpacing:"-1px",marginBottom:4}}>{t.dtitle}</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:18}}>{t.dsub}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {[["all",t.dall],...BLOOD_TYPES.map(tp=>[tp,tp])].map(([val,lb])=>(
                <button key={val} onClick={()=>setDFilter(val)} style={{
                  padding:"6px 12px",borderRadius:100,border:"none",cursor:"pointer",
                  fontSize:12,fontWeight:700,fontFamily:"inherit",
                  background:dFilter===val?"rgba(239,68,68,.18)":C.surf,
                  color:dFilter===val?"#f87171":C.sub,
                  border:dFilter===val?"1px solid rgba(239,68,68,.3)":`1px solid ${C.border}`,
                  transition:"all .15s"}}>{lb}</button>
              ))}
            </div>
            {dFilter!=="all"&&<div style={{fontSize:12,color:C.sub,marginBottom:14}}>🔍 {t.dshow} {dFilter}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
              {filtDonors.map(d=>(
                <div key={d.id} style={{padding:"16px 18px",borderRadius:14,
                  background:d.ok?C.surf:"rgba(255,255,255,.01)",
                  border:`1px solid ${d.ok?C.border:"rgba(255,255,255,.03)"}`,opacity:d.ok?1:.5}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:10,flexShrink:0,
                      background:d.ok?"linear-gradient(135deg,#ef4444,#b91c1c)":"rgba(100,116,139,.22)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:12,fontWeight:800,color:"#fff"}}>{d.type}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:1}}>{d.city}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:C.muted}}>📍 {d.dist}</span>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:6,height:6,borderRadius:"50%",
                        background:d.ok?"#4ade80":"#475569",
                        boxShadow:d.ok?"0 0 6px rgba(74,222,128,.5)":"none"}}/>
                      <span style={{fontSize:10,color:d.ok?"#4ade80":"#475569"}}>
                        {d.ok?t.davail:t.dunavail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtDonors.length===0&&<div style={{textAlign:"center",padding:"60px 20px",color:C.sub}}>{t.dnone}</div>}
          </div>
        )}

        {/* HOSPITALS */}
        {view==="hospitals"&&(
          <div style={{paddingTop:42,animation:"fu .4s ease"}}>
            {/* Header + emergency numbers */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:20}}>
              <div>
                <h2 style={{fontSize:24,fontWeight:700,letterSpacing:"-1px",marginBottom:4}}>{t.htitle}</h2>
                <p style={{fontSize:13,color:C.sub}}>{t.hsub}</p>
              </div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {[["🚑","118","rgba(239,68,68,.15)","rgba(239,68,68,.3)","#f87171"],
                  ["👮","112","rgba(59,130,246,.15)","rgba(59,130,246,.3)","#60a5fa"],
                  ["🔥","115","rgba(249,115,22,.15)","rgba(249,115,22,.3)","#fb923c"]].map(([icon,num,bg,border,col])=>(
                  <div key={num} style={{background:bg,border:`1px solid ${border}`,
                    borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
                    <div style={{fontSize:18}}>{icon}</div>
                    <div style={{fontSize:18,fontWeight:800,color:col}}>{num}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search + region filter */}
            <div style={{display:"flex",gap:9,flexWrap:"wrap",alignItems:"center",marginBottom:14}}>
              <div style={{position:"relative",flex:1,minWidth:220}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>🔍</span>
                <input style={{...inp,paddingLeft:40}} placeholder={t.hsearch}
                  value={hSearch} onChange={e=>{setHSearch(e.target.value);setExpanded(null);}}/>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {REGIONI.map(r=>{
                  const col=r==="Tutte"?"#f87171":(REG_COLORS[r]||"#94a3b8");
                  const active=hReg===r;
                  return(
                    <button key={r} onClick={()=>{setHReg(r);setExpanded(null);}} style={{
                      padding:"7px 12px",borderRadius:100,border:"none",cursor:"pointer",
                      fontSize:10,fontWeight:700,fontFamily:"inherit",
                      background:active?`${col}25`:C.surf,color:active?col:C.sub,
                      border:active?`1px solid ${col}55`:`1px solid ${C.border}`,
                      transition:"all .15s"}}>{r}</button>
                  );
                })}
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:18}}>
              {filtHosp.length} strutture {hReg!=="Tutte"?`in ${hReg}`:"in tutta Italia"}
            </div>

            {/* Grouped list */}
            {Object.keys(grouped).sort().map(reg=>(
              <div key={reg} style={{marginBottom:26}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
                  padding:"8px 14px",borderRadius:10,
                  background:`${REG_COLORS[reg]||"#64748b"}18`,
                  border:`1px solid ${REG_COLORS[reg]||"#64748b"}30`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,
                    background:REG_COLORS[reg]||"#64748b",
                    boxShadow:`0 0 6px ${REG_COLORS[reg]||"#64748b"}80`}}/>
                  <span style={{fontSize:13,fontWeight:700,color:REG_COLORS[reg]||"#94a3b8"}}>{reg}</span>
                  <span style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>{grouped[reg].length} strutture</span>
                </div>
                <div style={{display:"grid",gap:7}}>
                  {grouped[reg].map((o,idx)=>{
                    const key=`${reg}-${idx}`;
                    const open=expanded===key;
                    const col=REG_COLORS[reg]||"#64748b";
                    return(
                      <div key={key} style={{borderRadius:12,overflow:"hidden",
                        background:open?`linear-gradient(135deg,${col}0d,${C.surf})`:C.surf,
                        border:`1px solid ${open?col+"44":C.border}`,transition:"all .2s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",cursor:"pointer"}}
                          onClick={()=>setExpanded(open?null:key)}>
                          <div style={{background:`${col}20`,border:`1px solid ${col}35`,
                            borderRadius:8,padding:"5px 8px",textAlign:"center",flexShrink:0,minWidth:64}}>
                            <div style={{fontSize:8,color:col,letterSpacing:.5,textTransform:"uppercase"}}>città</div>
                            <div style={{fontSize:10,fontWeight:700,color:col,lineHeight:1.2}}>{o.c}</div>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:C.text,
                              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.n}</div>
                            {!open&&<div style={{fontSize:10,color:C.muted,marginTop:2,
                              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {o.a}</div>}
                          </div>
                          <span style={{fontSize:11,color:C.muted,flexShrink:0}}>{open?"▲":"▼"}</span>
                        </div>
                        {open&&(
                          <div style={{padding:"0 16px 14px",borderTop:`1px solid ${C.border}`}}>
                            <div style={{marginTop:12,background:C.card,borderRadius:10,padding:"12px 14px"}}>
                              <div style={{fontSize:11,color:C.sub,marginBottom:6,display:"flex",gap:6}}>
                                <span>📍</span>
                                <span><strong style={{color:C.text}}>{t.haddr}:</strong> {o.a}</span>
                              </div>
                              <div style={{fontSize:11,color:C.sub,display:"flex",gap:6}}>
                                <span>📞</span>
                                <span><strong style={{color:C.text}}>{t.hphone}:</strong>{" "}
                                  <a href={`tel:${o.t}`} style={{color:col,textDecoration:"none",fontWeight:600}}>{o.t}</a>
                                </span>
                              </div>
                            </div>
                            <div style={{display:"flex",gap:7,marginTop:9}}>
                              <a href={`https://maps.google.com/?q=${encodeURIComponent(o.n+", "+o.a)}`}
                                target="_blank" rel="noreferrer"
                                style={{flex:1,padding:"8px",borderRadius:9,
                                  background:`${col}15`,border:`1px solid ${col}30`,color:col,
                                  fontSize:11,fontWeight:600,textAlign:"center",textDecoration:"none",
                                  display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                                🗺️ {t.hmaps}
                              </a>
                              <a href="tel:118" style={{flex:1,padding:"8px",borderRadius:9,
                                background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",
                                color:"#f87171",fontSize:11,fontWeight:700,textAlign:"center",
                                textDecoration:"none",display:"flex",alignItems:"center",
                                justifyContent:"center",gap:5}}>
                                🚑 {t.h118}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filtHosp.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px",color:C.muted}}>
                <div style={{fontSize:40,marginBottom:12}}>🔍</div>
                <div>Nessun risultato per "{hSearch}"</div>
              </div>
            )}

            <div style={{marginTop:32,padding:"14px 18px",borderRadius:12,
              background:C.surf,border:`1px solid ${C.border}`,
              fontSize:11,color:C.muted,textAlign:"center",lineHeight:1.7}}>
              ⚠️ In emergenza chiama <strong style={{color:"#f87171"}}>118</strong> (ambulanza) o <strong style={{color:"#60a5fa"}}>112</strong> (emergenza generale)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
