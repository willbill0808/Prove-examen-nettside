const express = require("express");
const router = express.Router()

const path = require('path');
const { get_accounts, insert_card} = require("../functions");

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

        res.render("accounts", {user: req.payload, accounts: rows})
    }
})

router.post("/make", async (req, res) => {

    insert_card(req.payload.ID, req.body.cardName)

    const rows = await get_accounts(req.payload.ID)
    res.render("accounts", {user: req.payload, accounts: rows})
})

module.exports = router 