const searchParams = require("../../helpers/searchParams");


describe("searchParams()", () => {
    it("should generate correct sql query string with params", function() {
        let table = "companies";
        let queryParams = {'search': 'apple', 'min_employees': '300'};

        let expectedQuery = "SELECT * FROM companies WHERE lower(name) LIKE $1 AND num_employees >= $2";

        let searchedParams = searchParams(table, queryParams);

        expect(searchedParams.queryString).toEqual(expectedQuery);
        expect(searchedParams.values).toEqual(['%apple%', '300']);
    })
    it("should generate correct sql query when just one param passed in", function() {
        let table = "industries";
        let queryParams = {'max_employees': '1000'};

        let expectedQuery = "SELECT * FROM industries WHERE num_employees <= $1";
        
        expect(searchParams(table, queryParams).queryString).toEqual(expectedQuery);
        expect(searchParams(table, queryParams).values).toEqual(['1000']);
    })
    it ("should generate correct sql for searching jobs with one param", function() {
        let table = "jobs";
        let queryParams = {'min_salary': '90000'};

        let expectedQuery = "SELECT * FROM jobs WHERE salary >= $1";

        expect(searchParams(table, queryParams).queryString).toEqual(expectedQuery);
        expect(searchParams(table, queryParams).values).toEqual(['90000']);
    })
    it ("should generate correct sql for searching jobs with multiple params", function() {
        let table = "jobs";
        let queryParams = {'min_salary': '70000', 'search': 'engineer'};

        let expectedQuery = "SELECT * FROM jobs WHERE salary >= $1 AND lower(title) LIKE $2";

        expect(searchParams(table, queryParams).values).toEqual(['70000', '%engineer%']);
        expect(searchParams(table, queryParams).queryString).toEqual(expectedQuery);

    })
})