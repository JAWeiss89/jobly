const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");

const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
        if (Object.keys(req.query).length === 0) { // if no queries in request, get all companies
            const companies = await Company.getAll();
            return res.json({companies});
        } else { // else filter companies
            const companies = await Company.getSome(req.query);
            return res.json({companies});
        }

    } catch(err) {
        next(err);
    }
})


router.post("/", async function(req, res, next) {
    try {
        

    } catch(err) {
        next(err);
    }
}) 



module.exports = router;