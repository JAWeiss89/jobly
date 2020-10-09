const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");

const router = new express.Router();


router.post("/login", async function (req, res, next) {
    try {
        const {username, password} = req.body;
        const token = await User.authenticate(username, password);

        return res.json({token})
    } catch(err) {
        next(err);
    }
})

module.exports = router;