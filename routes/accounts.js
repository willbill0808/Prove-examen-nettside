const express = require("express");
const router = express.Router()

const path = require('path');


//
// Routes
//

router.get("/", async (req, res) => {
    if (!req.payload) {
        res.render("index", {user: req.payload, error: "You need to be loged inn for that page"}
    )
    }
    else {
        const rows = await get_accounts(req.payload.ID)

        res.render("accounts", {user: req.payload, accounts: rows[0]})
    }
})

module.exports = router 