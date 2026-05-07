# Prøve-examen-nettside
 
## Project: 
En bank nettside

## Tech:
* Node.js
* Express (Node.js) selve back-end
* Bcrypt (Node.js) for hashing
* mariaDB (SQL) Database
* Ejs (Node.js) view engine

## Exported functions:

* test_connection:
Kjører når serveren starter, passer på at alt med databasen fungerer som det skal, om noe går galt får du en error med en gang. 

* user_taken:
Trenger: UserName; Spør databasen om et bruker navn er tatt, returner true eller false.

* insert_user:
Trenger: UserName, plainPassword; Hasher Passord og inserter den med bruker-navn i User-databsen, lager også en default kort-konto.

* Authentication:
Trenger: User, plainPassword; Sammenligner det lagrede hashede passordet med plaintext passord, returner 0,1 eller 2, om 0 så er passord like.

* make_jwt:
Trenger: UserName; Legger username og userID i en jwt, også putter jwt-en i en cookie.

* get_accounts:
Trenger: ID; Henter ut alle kort-kontoer knyttet til den ID-en.

* insert_card:
Trenger: User_id, card_name; Lager en ny kort-konto knyttet til brukeren med navnet gitt, lager også et xxxx-xxxx-xxxx-xxxx kort nummer.

* transfer:
Trenger: cardHolder, card1, card2, amount; Overfører penger fra card1 til card2, og passer på at man bare kan sende fra sin egen konto.

---
# På dagen
* Email (nodemailer)
    * Logge inn med email
    * Få en email hver gang man overfører penger ut av konto
    * Få en mail hver gang man får penger inn på konto
    * 2FA

* Transaction history
    * Route side med all bruker historik
    * "Dette var ikke meg" funksjon for å undo en tidlige overføring
    * Sorter etter kort

* Enkle bruker støtte endringer
    * Slett konto knapp
    * Enkle settings (light og dark mode)
