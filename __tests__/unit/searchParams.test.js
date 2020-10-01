const searchParams = require("../../helpers/searchParams");


describe("searchParams()", () => {
    it("should generate correct sql query string with params", function() {
        let table = "companies";
        let queryParams = {'search': 'apple', 'min_employees': '300'};

        let expectedQuery = "SELECT handle, name FROM companies WHERE lower(name) LIKE '%$1%' AND num_employees >= $2";

        expect(searchParams(table, queryParams).queryString).toEqual(expectedQuery);
        expect(searchParams(table, queryParams).values).toEqual(['apple', '300']);
    })
    it("should generate correct sql query when just one param passed in", function() {
        let table = "industries";
        let queryParams = {'max_employees': '1000'};

        let expectedQuery = "SELECT handle, name FROM industries WHERE num_employees <= $1";
        
        expect(searchParams(table, queryParams).queryString).toEqual(expectedQuery);
        expect(searchParams(table, queryParams).values).toEqual(['1000']);
    })
})