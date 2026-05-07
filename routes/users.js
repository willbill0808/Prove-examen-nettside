const express = require("express");
const router = express.Router();
const path = require('path');

const { user_taken, insert_user, Authentication, make_jwt} = require("../functions");
const { error } = require("console");


//
// Routes
//

router.get("/log_out", async (req, res) => {
    res.clearCookie("Token"); // fjerner jwt info om bruker trykker på log out,
    req.payload = null // Fjerner all payload data  
    res.render("index", { user: req.payload })
})

router.get("/log_in", (req, res) => {
    res.render("log_in", { user: req.payload })
})


router.post("/log_in", async (req, res) => {
    userName = req.body.userName
    userPass = req.body.userPass

    auth_handle = await Authentication(userName, userPass) 

    if (auth_handle == 0) { // om auth_handle returnerer 0 (ingen feil) så blir jwt tokenen laget og puttet i browseren 

        const cookie = await make_jwt(userName)
        res.cookie("Token", cookie, {
            httpOnly: true,
            secure: false, 
            sameSite: "strict",
        });

        res.redirect("log_in")

    } else if (auth_handle == 1) { // om auth_handle returnerer 1 så ble ikke en bruker funnet med det brukernavnet
        res.render("log_in", { user: req.payload, error: "Either username or password is wrong"})
        return 
    } else if (auth_handle == 2) { // om auth_handle returnerer 2 så var ikke passordet gitt likt som det lagret i databasen 
        res.render("log_in", { user: req.payload, error: "Either username or password is wrong"})
        return 
    } 
})

router.get("/sign_in", (req, res) => {
    res.render("sign_in", { user: req.payload })
})

router.post("/sign_in", async (req, res) => {
    userName = req.body.userName
    userPass = req.body.userPass
    userPass2 = req.body.userPass2

    taken = await user_taken(userName) //sjekker om bruker navn er tatt

    if (taken) { // bruker navnet er tatt 
        res.render("sign_in", { user: req.payload, error: "Username already in use" })
        return 0
    }

    if (userPass != userPass2) { // passordene er ikke like
        res.render("sign_in", { user: req.payload, error: "Passwords don't match" })
        return 0
    }
    
    insert_user(userName, userPass) // lager den nye brukeren
    res.render("sign_in", { user: req.payload, text: "User Created successfully" })
})

module.exports = router 