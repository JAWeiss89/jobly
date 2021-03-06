const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const newJobSchema = require("../schemas/newJob.json");
const jobSchema = require("../schemas/job.json");
const {ensureLoggedIn, ensureAdmin} = require("../middleware/auth");

const router = new express.Router();

router.get("/", ensureLoggedIn, async function(req, res, next) {
    try {
        // Check if query params are valid
        let paramsValidated = false;
        let queryParams = Object.keys(req.query); 
        let acceptableParams = ['search', 'min_salary', 'max_salary'];
        for (let param of queryParams) {
            if (acceptableParams.includes(param)) {
                paramsValidated = true;
            }
        }
        if (Object.keys(req.query).length !== 0 && paramsValidated) {
            // if there are queries in request and they are valid get filtered results
            const jobs = await Job.getSome(req.query);
            return res.json({jobs})
        } else {
            // else get all of the jobs
            const jobs = await Job.getAll();
            return res.json({jobs})
        }
    } catch(err) {
        next(err);
    }
})

router.post("/", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const validationResults = jsonschema.validate(req.body, newJobSchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400);
        } 
        const job = await Job.create(req.body.job)
        return res.status(201).json({job})

    } catch(err) {
        next(err);
    }
})

router.get("/:id", ensureLoggedIn, async function(req, res, next) {
    try {
        const {id} = req.params;
        const job = await Job.getOne(id);
        return res.json({job});

    } catch(err) {
        next(err);
    }
})

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const {id} = req.params;
        const validationResults = jsonschema.validate(req.body, jobSchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400);
        }
        const job = await Job.update(id, req.body.job);
        return res.json({job})

    } catch(err) {
        next(err);
    }
})

router.delete("/:id", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const {id} = req.params;
        const jobDeleted = await Job.delete(id);

        return res.json({message: `Job of ID: ${id} deleted`})
    } catch(err) {
        next(err);
    }
})


module.exports = router;