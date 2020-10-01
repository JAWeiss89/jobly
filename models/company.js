const db = require("../db");
const searchParams = require("../helpers/searchParams");

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

}

module.exports = Company;