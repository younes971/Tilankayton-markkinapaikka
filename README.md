## Tilankäytön markkinapaikka
Monialustaprojekti / yksilötyö

## Sovellusidea:

-markkinapaikka tilojen jakamiseen

-käyttäjät voivat lisätä ja selata tiloja

-tavoite: parempi tilojen käyttö ja vähemmän tyhjää tilaa

## Ominaisuudet:

-käyttäjä voi rekisteröityä ja kirjautua

-käyttäjä voi lisätä tilan

-käyttäjä voi muokata omaa tilaa

-käyttäjä voi poistaa oman tilan

-tilojen selaus

-tilan varaus

-tykkäys (like)

-kommentit

-haku

-lajittelu hinnan mukaan (low-high / high-low)

## Käyttö:

Frontend:

-npm install

-npm run dev

Backend:

-npm install

-node index.js

##Teknologiat:

-React

-Node.js / Express

-REST API

-Database (MySQL)

## Toteutetut toiminnallisuudet

-Käyttäjän rekisteröinti
-Kirjautuminen
-JWT-autentikointi
-Tilan lisääminen kuvalla
-Tilojen selaaminen
-Hakutoiminto
-Lajittelu hinnan mukaan
-Tilan varaaminen
-Oman tilan muokkaaminen
-Oman tilan poistaminen
-Tykkäystoiminto
-Kommentointi
-Omat tilat -näkymä
-Responsiivinen käyttöliittymä

## Tietokannan rakenne:

Sovelluksessa käytän MySQL/MariaDB-tietokantaa.

Taulut:

- users
- spaces
- comments
- space likes

Relaatiot:

- users voi luoda useita (spaces)
- spaces voi sisältää useita (comments)
- users voi tykätä useista (spaces) taulun space likes kautta

 Kuvakaappauset (Liitteenä)

 ## Backend / API

Backend toimii paikallisesti Node.js ja Express-palvelimella portissa 3001
API-reittejä käytetään frontendin kautta






