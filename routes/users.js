const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');


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
    
    console.log(userName)
    console.log(userPass)
    console.log(userPass2)


    if (userPass != userPass2) {
        console.log("passwords dont match")
        res.render("registrer", { user: req.payload, error: "Passwords don't match" })
        return 0
    }
    console.log("passwords match")
})

module.exports = router 