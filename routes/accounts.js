const express = require("express");
const router = express.Router()

const path = require('path');
const { get_accounts, insert_card} = require("../functions");
const { error } = require("console");

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

    const result = await insert_card(req.payload.ID, req.body.cardName)

    if (result == 0){

        const rows = await get_accounts(req.payload.ID)
        res.render("accounts", {user: req.payload, accounts: rows, error: "Card created successfully"})
    } else if (result == 1) {
        const rows = await get_accounts(req.payload.ID)
        res.render("accounts", {user: req.payload, accounts: rows, error: "You already have a card with that name"})
    }
})

router.get("/transfer", async (req, res) => {
    if (!req.payload) {
        res.render("index", {user: req.payload, error: "You need to be loged inn for that page"}
    )
    }
    else {
        const rows = await get_accounts(req.payload.ID)

        res.render("transfer", {user: req.payload, accounts: rows})
    }
})

module.exports = router 