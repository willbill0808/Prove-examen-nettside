const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');

const DB = require("../sql");
const { user_taken, insert_user } = require("../sql");


//
// Routes
//

router.get("/log_in", (req, res) => {
    res.render("log_in", { user: req.payload })
})




router.get("/sign_in", (req, res) => {
    res.render("sign_in", { user: req.payload })
})

router.post("/sign_in", async (req, res) => {
    console.log(req.body)
    userName = req.body.userName
    userPass = req.body.userPass
    userPass2 = req.body.userPass2

    taken = await user_taken(userName)

    if (taken) {
        res.render("sign_in", { user: req.payload, error: "Username already in use" })
        return 0
    }

    if (userPass != userPass2) {
        res.render("sign_in", { user: req.payload, error: "Passwords don't match" })
        return 0
    }
    
    insert_user(userName, userPass)
    res.render("sign_in", { user: req.payload, error: "User Created successfully" })
})

module.exports = router 