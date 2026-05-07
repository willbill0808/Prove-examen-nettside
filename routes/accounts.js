const express = require("express");
const router = express.Router()

const path = require('path');
const { get_accounts, insert_card, transfer} = require("../functions");
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
        res.render("accounts", {user: req.payload, accounts: rows, text: "Card created successfully"})
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

router.post("/transfer", async (req, res) => {
    if (!req.payload) {
        res.render("index", {user: req.payload, error: "You need to be loged inn for that page"}
    )
    }
    else {
        const cardHolder = req.payload.ID
        const cardId = req.body.cardNumber
        const cardId2 = req.body.cardNumber2
        const amount =  req.body.amount

        const result = await transfer(cardHolder, cardId, cardId2, amount)

        if (result == 0){
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, text: "Money transfered successfully"})
        } else if (result === 1){
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "Transfer amount must be above 0"})
        } else if (result === 2){
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "You don`t own a card with tha number"})
        } else if (result === 3){
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "You don`t have enough on that card to transfer"})
        } else if (result === 4){
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "Could not find recipiant"})
        }

    }
})


module.exports = router 