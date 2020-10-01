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

}

module.exports = Company;