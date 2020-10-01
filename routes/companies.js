const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/company.json");

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
        const validationResults = jsonschema.validate(req.body, companySchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400);
        } 
        const company = await Company.create(req.body.company)
        return res.status(201).json({company})

    } catch(err) {
        next(err);
    }
})

router.get("/:handle", async function(req, res, next) {
    try {
        const {handle} = req.params;
        const company = await Company.getOne(handle);
        return res.json({company})

    } catch(err) {
        next(err)
    }
})

router.patch("/:handle", async function(req, res, next) {
    try {
        const {handle} = req.params;
        const validationResults = jsonschema.validate(req.body, companySchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400);
        }
        const company = await Company.update(handle, req.body.company);
        return res.json({company})
    } catch(err) {
        next(err);
    }
})


module.exports = router;