const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const User = process.env.SQL_User
const PSWD = process.env.SQL_PSWD
const DataBase = process.env.SQL_DataBase
const UserTable = process.env.SQL_UserTable
const AccountTable = process.env.SQL_AccountTable

const mail_user = process.env.SMTP_USER
const mail_pass = process.env.SMTP_PASS

const saltRounds = Number(process.env.Hash_SaltRounds) // hvor mange runder med genSalt som skal bli gjort før et passord blir hashet

const TOKEN = process.env.TOKEN

const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: TOKEN,
    })
);

const sender = {
    address: "hello@demomailtrap.co",
    name: "NordBank",
};

var connection = mysql.createConnection({
    host: 'localhost',
    user: User,
    password: PSWD,
    database: DataBase
}).promise(); // all info om hvordan serveren skal logge seg på og snakke med mariaDB


async function test_connection_mail() {
    console.log("Testing connection...");
    try {
        await transport.verify();
        console.log("Server is ready to take our messages");
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

async function test_connection_mariaDB() {
    try {
        await connection.query("SELECT 1");
        console.log("Connected to DataBase");
    } catch (err) {
        console.error("Problem connecting to DataBase:", err.message);
    }
} // kjører for å se om du faktisk får koble opp til databasen, gir deg en feil melding så snart serveren starter om noe er galt

//
// Functions
//
async function add_Email(User, Email) {
    console.log(User)
    console.log(Email)
    const [[user]] = await connection.query(`SELECT User_name, Email FROM ${UserTable} WHERE User_name = ?;`, [User])
    console.log(user)

    if (user.length === 0){ return 1} // fant ingen bruker med det bruker navnet
    if (user.Email != null) {return 2} // bruker har alerede an email 

    const result = await connection.query(`UPDATE ${UserTable} SET Email = ? WHERE User_name = ?;`, [Email, User])

    return 1

}

function send_mail(recipients, header, content) {
    transport.sendMail({
        from: sender,
        to: recipients,
        subject: header,
        text: content,
        category: "Integration Test",
    })
        .then(console.log, console.error);
}

async function transfer(cardHolder, card1, card2, amount) { // funksjonen til å overføre penger

    if (amount <= 0) { return 1 } // sjekker om amount er over 0

    const [[Account1]] = await connection.query(`SELECT Account_number, Balance, User_id FROM ${AccountTable} WHERE Account_number = ?;`, [card1])
    const [[Account2]] = await connection.query(`SELECT Account_number, Balance, User_id FROM ${AccountTable} WHERE Account_number = ?;`, [card2])
    const [[result]] = await connection.query(`SELECT User_name, Email FROM ${UserTable} WHERE ID = ?;`, [cardHolder])

    const Email = result.Email

    if (Account1.length === 0) { return 2 } // om ingen ting er i Account1 så finnes ikke den kort-kontoen
    if (Account1.User_id != cardHolder) { return 2 } // om User_id og cardHolder ikke er like så prøver noen som ikke er den faktiske eieren å overføre
    if (parseFloat(Account1.Balance) < amount) { return 3 } // mengden på kortet er mindre enn det som skal bli overført
    if (Account2.length === 0) { return 4 } // kortet som har ment til å mota pengene finnes ikke

    const result1 = await connection.query(`UPDATE ${AccountTable} SET Balance = Balance - ? WHERE Account_number = ?`, [amount, card1])
    const result2 = await connection.query(`UPDATE ${AccountTable} SET Balance = Balance + ? WHERE Account_number = ?`, [amount, card2])

    if (Email === null){return 0}

    const content = `
    Money has been sendt from your account (${card1}).
    The money was sent to ${card2}.
    The amount transfered was equal to ${amount}Kr.
    
    `

    send_mail(Email, "A transfer has ocured", content)



    return 0 // ingenting galt funnet
}

async function get_accounts(ID) { // Henter ut kort-konto data basert på bruker id
    const [Accounts] = await connection.query(`SELECT Account_name, Account_number, Balance, Created_at FROM ${AccountTable} WHERE User_id = ?;`, [ID])
    return Accounts
}

async function make_jwt(UserName) { // Lager en jwt med all nyttig info om brukeren
    const [rows] = await connection.query(`SELECT ID, User_name FROM ${UserTable} WHERE User_name = ?`, [UserName]);
    return jwt.sign(rows[0], process.env.ACCESS_TOKEN_SECRET)
}

async function add_admin() { // Legger til en admin bruker om det ikke finnes en enda
    var taken = await user_taken("Admin")
    if (taken == false) { // om admin brukeren ikke er laget enda så lages den 
        await insert_user("Admin", "admin", 11122333)

        const [User_id] = await connection.query(`SELECT ID FROM ${UserTable} WHERE User_name = ?;`, ["Admin"])

        insert_card(User_id[0].ID, "Admin nr.2") // Lager en extra kort-konto knyttet til admin brukeren 
    }
}

async function user_taken(User) { // funksjonen som ser om et brukernavn er  i bruk
    const [rows] = await connection.query(`SELECT User_name FROM ${UserTable} WHERE User_name = ?;`, [User])

    if (rows.length === 0) { return false } // om rows er tom så ble ikke noen bruker funnet

    return true
}

async function insert_user(UserName, plainPassword, phoneNumber) { // legger til en ny bruker 
    HashedPassword = await bcrypt.hash(plainPassword, saltRounds); // hasher passordet før det blir lagret i databasen
    const result = await connection.query(`INSERT INTO ${UserTable} (User_name, Password, Phone_number) VALUES (?, ?, ?)`, [UserName, HashedPassword, phoneNumber])

    const [User_id] = await connection.query(`SELECT ID FROM ${UserTable} WHERE User_name = ?;`, [UserName])

    insert_card(User_id[0].ID, "Default-card") // legger til en kort-konto som heter Default-card på alle nye brukere 
    return
}

async function insert_card(User_id, card_name) { // funksjonen som lager kort-kontoer

    const cards = await connection.query(`SELECT Account_name FROM ${AccountTable} WHERE User_id = ?;`, [User_id])

    for (let i = 0; i < cards[0].length; i++) { // sjekker om navnet som har blitt valgt har blitt brukt før av bruker
        if (cards[0][i].Account_name === card_name) { return 1 }
    }


    function fourDigits() { // en funksjon som lager et 4 sifret tall 
        return Math.floor(1000 + Math.random() * 9000);
    }

    let card_number;
    let exists = true;

    while (exists) {
        card_number = `${fourDigits()}-${fourDigits()}-${fourDigits()}-${fourDigits()}`; // bruker fourDigits funksjonen til å lage og formatere et ekte-seende kort nummer

        const [rows] = await connection.query(
            `SELECT 1 FROM ${AccountTable} WHERE Account_number = ? LIMIT 1`,
            [card_number]
        );

        exists = rows.length > 0; // sjekker om kort nummeret har blitt tatt
    }

    await connection.query(`INSERT INTO ${AccountTable} (User_ID, Account_name, Account_number) VALUES (?, ?, ?)`, [User_id, card_name, card_number]);

    return 0
}

async function Authentication(User, plainPassword) { // funksjonen som sjekker om brukernavnet ok passordet tastet inn i /log_in er riktig

    var taken = await user_taken(User)
    if (taken == false) { return 1 } // ser om brukeren finnes

    const [rows] = await connection.query(`SELECT * FROM ${UserTable} WHERE User_name = ?`, [User])
    comp = await bcrypt.compare(plainPassword, rows[0].Password) // denne bcrypt funksjonen sammen ligner det lagrede hshet passordet med plaintext passordet 

    if (comp) { return 0 } // passordene er like 

    return 2 // passordene er ulike
}

//
// On start-up
//

connection.query(`CREATE TABLE IF NOT EXISTS ${UserTable} (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    User_name VARCHAR(50) NOT NULL UNIQUE,
    Phone_number INT(15) NOT NULL UNIQUE,
    Email VARCHAR(100),
    Password VARCHAR(255) NOT NULL
);`) // Lager bruker databasen

connection.query(`CREATE TABLE IF NOT EXISTS ${AccountTable} (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    User_id INT UNSIGNED NOT NULL,
    Account_name VARCHAR(100) NOT NULL,
    Account_number VARCHAR(19) NOT NULL UNIQUE,
    Balance DECIMAL(12,2) DEFAULT 1000.00,
    
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX(User_id), -- lager en index på User_id 

    CONSTRAINT fk_user_accounts -- navngir foreign-key constrainten, om det er noe feil dukker opp i feilmeldingen.
    FOREIGN KEY (User_id)       -- sier at alle kontoer må tilhøre en ekte bruker
    REFERENCES ${UserTable}(ID) -- sier at alle kontoer må tilhøre en ekte bruker
    ON DELETE CASCADE           -- om en bruker blir slettet, blir alle kontoer koblet opp til den slettet også
);`) // Lager databasen som har kort-kontoene

add_admin()

module.exports = { // exporter alle nyttige funksjoner
    connection,
    test_connection_mariaDB,
    test_connection_mail,
    user_taken,
    insert_user,
    Authentication,
    make_jwt,
    get_accounts,
    insert_card,
    transfer,
    add_Email,
} 
