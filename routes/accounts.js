const express = require("express");
const router = express.Router()

const path = require('path');
const { get_accounts, insert_card, transfer} = require("../functions");
const { error } = require("console");

//
// Routes
//

router.get("/", async (req, res) => {
    if (!req.payload) { // om du ikke er logget inn blir du sent til home
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

    if (result == 0){ // om result returnerer 0 (ingen feil) så blir kontoen laget
        const rows = await get_accounts(req.payload.ID)
        res.render("accounts", {user: req.payload, accounts: rows, text: "Card created successfully"})
    } else if (result == 1) {  // om result returnerer 1 (navnet på konten er alerede i bruk av denne brukeren) så blir kontoen ikke laget
        const rows = await get_accounts(req.payload.ID)
        res.render("accounts", {user: req.payload, accounts: rows, error: "You already have a card with that name"})
    }
})

router.get("/transfer", async (req, res) => {
    if (!req.payload) { // om du ikke er logget inn blir du sent til home
        res.render("index", {user: req.payload, error: "You need to be loged inn for that page"})
    }
    else {

        const rows = await get_accounts(req.payload.ID)
        res.render("transfer", {user: req.payload, accounts: rows})
    }
})

router.post("/transfer", async (req, res) => {
    if (!req.payload) { // om du ikke er logget inn blir du sent til home
        res.render("index", {user: req.payload, error: "You need to be loged inn for that page"}
    )
    }
    else {
        const cardHolder = req.payload.ID
        const cardId = req.body.cardNumber
        const cardId2 = req.body.cardNumber2
        const amount =  req.body.amount

        console.log(cardId2)

        const result = await transfer(cardHolder, cardId, cardId2, amount)

        if (result == 0){ // om result returnerer 0 (ingen feil) så blir pengene overført
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, text: "Money transfered successfully"})
        } else if (result === 1){ // om result returnerer 1 (amount er 0 eller mindre) så blir pengen ikke overført, fordi da blir pengene i effekt stjålet om amount er i minus
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "Transfer amount must be above 0"})
        } else if (result === 2){ // om result returnerer 2 (ikke noe kort ble funnet, eller kortet som ble funnet er ikke ditt) blir ikke pengene overført, fordi ellers hadde det vert mulig å stjele fra andre sine kontoer
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "You don`t own a card with that number"})
        } else if (result === 3){ // om result returnerer 3 (Pengene på kortet er mindre en amount) så blir ikke pengen overført, fordi da kan man bare overføre uendelig med penger
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "You don`t have enough on that card to transfer"})
        } else if (result === 4){ // om result returnerer 4 så ble ikke mottaker kontoen funnet
            const rows = await get_accounts(req.payload.ID)
            res.render("transfer", {user: req.payload, accounts: rows, error: "Could not find recipiant"})
        }

    }
})


module.exports = router 