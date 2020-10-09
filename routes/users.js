const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const newUserSchema = require("../schemas/newUser.json");
const userSchema = require("../schemas/user.json");
const {ensureLoggedIn, ensureSameUser} = require("../middleware/auth");


const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        const users = await User.getAll();
        return res.json({users})

    } catch(err) {
        next(err);
    }
})

router.post("/", async function(req, res, next) {

    try {
        const validationResults = jsonschema.validate(req.body, newUserSchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400);
        } 
        // const user = await User.create(req.body.user);
        const token = await User.create(req.body.user);

        return res.status(201).json({token})

    } catch(err) {
        next(err);
    }
})

router.get("/:username", async function(req, res, next) {
    try {
        const {username} = req.params;
        const user = await User.getOne(username);
        return res.json({user})
    } catch(err) {
        next(err);
    }
})

router.patch("/:username", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    try {
        const {username} = req.params;
        const validationResults = jsonschema.validate(req.body, userSchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400);
        }
        const user = await User.update(username, req.body.user);
        return res.json({user})

    } catch(err) {
        next(err);
    }
})

router.delete("/:username", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    try {
        const {username} = req.params;
        const userDeleted = await User.delete(username);

        return res.json({message: `User ${userDeleted.username} deleted`})
    } catch(err) {
        next(err);
    }
})

module.exports = router;