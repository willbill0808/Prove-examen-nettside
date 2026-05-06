const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');

const DB = require("../sql");
const { user_taken, insert_user } = require("../sql");


//
// Routes
//

router.get("/registrer", (req, res) => {
    res.render("registrer", { user: req.payload })
})

router.post("/registrer", async (req, res) => {
    console.log(req.body)
    userName = req.body.userName
    userPass = req.body.userPass
    userPass2 = req.body.userPass2

    taken = await user_taken(userName)

    if (taken) {
        res.render("registrer", { user: req.payload, error: "Username already in use" })
        return 0
    }

    if (userPass != userPass2) {
        res.render("registrer", { user: req.payload, error: "Passwords don't match" })
        return 0
    }
    
    insert_user(userName, userPass)
    res.render("registrer", { user: req.payload, error: "User Created successfully" })
})

module.exports = router 