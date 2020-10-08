const db = require("../db");
const searchParams = require("../helpers/searchParams");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Job {

    // static methods
    static async getAll() {
        const jobResults = await db.query(
            `SELECT * FROM jobs`
        );
        const jobs = jobResults.rows;
        return jobs;
    }

    static async getSome(queryParams) {
        const jobsQuery = searchParams('jobs', queryParams);
        const jobResults = await db.query(
            `${jobsQuery.queryString}`, jobsQuery.values
        )
        const jobs = jobResults.rows;
        return jobs;
    }

    static async getOne(id) {
        const results = await db.query(
            `SELECT * FROM jobs WHERE id=$1`, [id]
        )
        if (results.rows.length===0) {
            throw new ExpressError(`Could not find a job with id ${id}.`, 404)
        }
        return results.rows[0];
    }

    static async create(newJobObj) {
        const {title, salary, equity, company_handle} = newJobObj;
        const date_posted = new Date();
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle, date_posted)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [title, salary, equity, company_handle, date_posted]
        );
        return result.rows[0];
    }
    
    static async update(id, jobData) {
        const {query, values} = partialUpdate('jobs', jobData, 'id', id);
        
        const result = await db.query(query, values);
        if (result.rows.length==0) {
            throw new ExpressError(`Could not find job with id ${id}`, 404);
        }
        return result.rows[0];
    }

    static async delete(id) {
        const results = await db.query(
            `DELETE FROM jobs WHERE id=$1 RETURNING title`, [id]
        )
        if (results.rows.length===0) {
            throw new ExpressError(`Could not find a job with id ${id}.`, 404)
        }
        return results.rows[0];
    }


}

module.exports = Job;