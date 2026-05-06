const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');

const DB = require("../sql");
const { user_taken, insert_user, Authentication, make_jwt} = require("../sql");
const { error } = require("console");


//
// Routes
//

router.get("/log_in", (req, res) => {
    res.render("log_in", { user: req.payload })
})


router.post("/log_in", async (req, res) => {
    userName = req.body.userName
    userPass = req.body.userPass

    auth_handle = await Authentication(userName, userPass)

    if (auth_handle == 0) {

        const cookie = await make_jwt(req.body.userName)
        res.cookie("Token", cookie, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.redirect("log_in")

    } else if (auth_handle == 1) {
        res.render("log_in", { user: req.payload, error: "User does not exist"})
        return 
    } else if (auth_handle == 2) {
        res.render("log_in", { user: req.payload, error: "Either username or password is wrong"})
        return 
    } else if (auth_handle == 3) {
        res.render("log_in", { user: req.payload, error: "There was an issue logging inn"})
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