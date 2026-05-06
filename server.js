const express = require("express");
const app = express()
const bodyParser = require('body-parser')
const path = require('path');
const cookieParser = require("cookie-parser");


const userRouter = require("./routes/users")
//const accountRouter = require("./routes/accounts")

///
/// app.use/set
///

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.set("view engine", "ejs")

///
/// routes
///

app.get("/", (req, res) => {
    res.render("index", {user: req.payload})
})

app.use("/users", userRouter)
//app.use("/accounts", accountRouter)

////
app.listen(8080, () => {
    console.log("\nServer is up and running! On http://localhost:8080")
})