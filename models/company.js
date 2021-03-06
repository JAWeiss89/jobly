const db = require("../db");
const searchParams = require("../helpers/searchParams");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");


class Company {
    
    // static methods
    static async getAll() {
        const companyResults = await db.query(
            `SELECT handle, name FROM companies`
        );
        const companies = companyResults.rows;
        return companies;
    }

    static async getSome(queryParams) {
        const companiesQuery = searchParams('companies', queryParams);
        const companyResults = await db.query(
            `${companiesQuery.queryString}`, companiesQuery.values
        )
        const companies = companyResults.rows;
        return companies;
    }

    static async getOne(handle) {
        const results = await db.query(
            `SELECT * FROM companies
            WHERE handle=$1`, [handle]
        )
        const jobResults = await db.query(
            `SELECT title, salary FROM jobs
            WHERE company_handle=$1`, [handle]
        )
        if (results.rows.length===0) {
            throw new ExpressError(`Could not find a company with handle ${handle}.`, 404)
        }
        results.rows[0].jobs = jobResults.rows;
        return results.rows[0];
    }

    static async create(newCompanyObj) {
        // assume obj has all methods
        const { handle, name, num_employees, description, logo_url } = newCompanyObj;
        const result = await db.query(
            `INSERT INTO companies
            (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `, 
            [handle, name, num_employees, description, logo_url]
        );
        return result.rows[0];
    }

    static async update(handle, companyData) {
        const {query, values} = partialUpdate('companies', companyData, 'handle', handle);

        const result = await db.query(query, values);
        if (result.rows.length===0) {
            throw new ExpressError(`Could not find a company with handle ${handle}.`, 404)
        }
        return result.rows[0];
    }

    static async delete(handle) {
        const results = await db.query(
            `DELETE FROM companies WHERE handle=$1 RETURNING name`, [handle]
        )
        if (results.rows.length===0) {
            throw new ExpressError(`Could not find a company with handle ${handle}.`, 404)
        }
        return results.rows[0];
    }

}

module.exports = Company;