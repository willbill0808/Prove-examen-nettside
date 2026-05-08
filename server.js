require('dotenv').config(); // laster in alle .env variablene

const express = require("express");
const app = express()
const bodyParser = require('body-parser')
const path = require('path');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const userRouter = require("./routes/users")
const accountRouter = require("./routes/accounts");
const { test_connection } = require('./functions');

app.set("view engine", "ejs") // sier at "ejs" skal bli brukt og ikke html, ejs filene blir lagret i views/



// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

///
/// Middle-ware
///

app.use(bodyParser.urlencoded({ extended: false })) // Tolker data fra req.body, som gjør det mulig å hente informasjon derfra
app.use(express.static(path.join(__dirname, 'public'))); // Serverer "Static" filer fra public/ (css og eventuelt bilder eller .js)
app.use(cookieParser()); // Leser req.cookie, som gjør det mulig å lese jwt info


app.use((req, res, next) => { // Et Middle-ware som henter ut jwt info om det er i browseren, også parser den i req.payload
    console.log("request hit:", req.method, req.url) // logger hvem som kobler til
    if (req.cookies.Token) {
        try {
            const payload = jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET)
            req.payload = payload
        } catch (err) {
            console.error("Invalid token:", err.message)
            res.clearCookie("Token") 
        }
    }
    next() // sier at neste middle ware skal kjøre
})

///
/// routes
///

app.get("/", (req, res) => {
    res.render("index", { user: req.payload })
})

app.use("/users", userRouter) // sier at den også skal bruke routes fra /users
app.use("/accounts", accountRouter) // sier at den også skal bruke routes fra /accounts

////
app.listen(8080, async () => {
    console.log("\nServer is up and running! On http://localhost:8080")
    await test_connection() // kjører for å se om du har tilgang til mariaDB datbasen
})