const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const newCompanySchema = require("../schemas/newCompany.json");
const companySchema = require("../schemas/company.json");
const {ensureLoggedIn, ensureAdmin} = require("../middleware/auth");

const router = new express.Router();

router.get("/", ensureLoggedIn, async function (req, res, next) {
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


router.post("/", ensureAdmin, async function(req, res, next) {
    try {
        const validationResults = jsonschema.validate(req.body, newCompanySchema);
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

router.get("/:handle", ensureLoggedIn, async function(req, res, next) {
    try {
        const {handle} = req.params;
        const company = await Company.getOne(handle);
        return res.json({company})

    } catch(err) {
        next(err)
    }
})

router.patch("/:handle", ensureAdmin, async function(req, res, next) {
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

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
    try {
        const {handle} = req.params;
        const companyDeleted = await Company.delete(handle);

        return res.json({message: `Company ${companyDeleted.name} deleted`})

    } catch(err) {
        next(err);
    }
})


module.exports = router;