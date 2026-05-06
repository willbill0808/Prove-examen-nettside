const mysql = require('mysql2');
const bcrypt = require('bcrypt');

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




//
// Functions
//

async function add_admin(){
    var taken = await user_taken("Admin")
    if (taken == false) {
        console.log("admin not taken")
        await insert_user("Admin", "admin")
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
    console.log(result)
    return
}

async function Authentication(User, plainPassword) {
    HashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const [rows] = await connection.query(`SELECT User_name,Password FROM ${UserTable} WHERE User_name = ?;`, [User])
    console.log(rows)
    var taken = await user_taken(User)
    if (taken == false) { 
        return 1
    }

    if(rows.Password == HashedPassword){
        return 0
    } 
    
    
}

add_admin()

module.exports = {
    connection,
    user_taken,
    insert_user,
    Authentication,
} 
