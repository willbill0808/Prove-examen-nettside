require('dotenv').config();


const express = require("express");
const app = express()
const bodyParser = require('body-parser')
const path = require('path');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');

const userRouter = require("./routes/users")
const accountRouter = require("./routes/accounts")

app.set("view engine", "ejs")

///
/// Middle-ware
///

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use((req, res, next) => { // Et Middle-ware som henter ut jwt om det er en, også parser den i req(request)
    if (req.cookies.Token) {
        const payload = jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET)

        req.payload = payload
    }
    
    next()
})

///
/// routes
///

app.get("/", (req, res) => {
    res.render("index", {user: req.payload})
})

app.use("/users", userRouter)
app.use("/accounts", accountRouter)

////
app.listen(8080, () => {
    console.log("\nServer is up and running! On http://localhost:8080")
})