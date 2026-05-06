const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = process.env.SQL_User
const PSWD = process.env.SQL_PSWD
const DataBase = process.env.SQL_DataBase
const UserTable = process.env.SQL_UserTable
const AccountTable = process.env.SQL_AccountTable

const saltRounds = Number(process.env.Hash_SaltRounds)

var connection = mysql.createConnection({
  host: 'localhost',
  user: User,
  password: PSWD,
  database: DataBase
}).promise();

connection.connect((err) => {
  if (err) {
    console.error("problem Connecting to DataBase: ", err.message)
    return;
  }
  console.log("Connected to DataBase")
});

//
// Functions
//

async function get_accounts(ID) {
    const [Accounts] = await connection.query(`SELECT Account_name, Account_number, Balance, Created_at FROM ${AccountTable} WHERE User_id = ?;`, [ID])
    console.log(Accounts)
    return Accounts
}

async function make_jwt(UserName) {
    const [rows] = await connection.query(`SELECT ID, User_name FROM ${UserTable} WHERE User_name = ?`, [UserName]);
    console.log(rows[0])
    return jwt.sign(rows[0], process.env.ACCESS_TOKEN_SECRET)
}

async function add_admin(){
    var taken = await user_taken("Admin")
    if (taken == false) {
        console.log("admin not taken")
        await insert_user("Admin", "admin")
    
        const [User_id] = await connection.query(`SELECT ID FROM ${UserTable} WHERE User_name = ?;`, ["Admin"])

        insert_card(User_id[0].ID, "Admin nr.2")
    }
}

async function user_taken(User) { 
    const [rows] = await connection.query(`SELECT User_name FROM ${UserTable} WHERE User_name = ?;`, [User])

    if (rows.length === 0)
        return false
    
    return true
}

async function insert_user(UserName, plainPassword) {
    HashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const result = await connection.query(`INSERT INTO ${UserTable} (User_name, Password) VALUES (?, ?)`, [UserName, HashedPassword])

    const [User_id] = await connection.query(`SELECT ID FROM ${UserTable} WHERE User_name = ?;`, [UserName])

    insert_card(User_id[0].ID, "Default-card")
    return
}

async function insert_card(User_id, Account_name) {

    function fourDigits() {
        return Math.floor(1000 + Math.random() * 9000);
    }

    let card_number;
    let exists = true;

    while (exists) {
        card_number = `${fourDigits()}-${fourDigits()}-${fourDigits()}-${fourDigits()}`;

        const [rows] = await connection.query(
            `SELECT 1 FROM ${AccountTable} WHERE Account_number = ? LIMIT 1`,
            [card_number]
        );

        exists = rows.length > 0;
    }

    await connection.query(`INSERT INTO ${AccountTable} (User_ID, Account_name, Account_number) VALUES (?, ?, ?)`, [User_id, Account_name, card_number]);

    return
}

async function Authentication(User, plainPassword) {
    
    var taken = await user_taken(User)
    if (taken == false) { 
        return 1
    }

    const [rows] = await connection.query(`SELECT * FROM ${UserTable} WHERE User_name = ?`, [User])
    comp = await bcrypt.compare(plainPassword, rows[0].Password)
    if(comp){
        return 0
    } else if(rows[0].Password != HashedPassword){
        return 2
    } 
    return 3
}

//
// On start-up
//

connection.query(`CREATE TABLE IF NOT EXISTS ${UserTable} (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    User_name VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL
);`)

connection.query(`CREATE TABLE IF NOT EXISTS ${AccountTable} (
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    User_id INT UNSIGNED NOT NULL,
    Account_name VARCHAR(100) NOT NULL,
    Account_number VARCHAR(19) NOT NULL UNIQUE,
    Balance DECIMAL(12,2) DEFAULT 1000.00,
    
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX(User_id),
    
    CONSTRAINT fk_user_accounts
    FOREIGN KEY (User_id)
    REFERENCES ${UserTable}(ID)
    ON DELETE CASCADE
);`)

add_admin()

module.exports = {
    connection,
    user_taken,
    insert_user,
    Authentication,
    make_jwt,
    get_accounts,
} 
