process.env.NODE_ENV="test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one company into test database

let testCompany;

beforeEach( async () => {
    await db.query(`DELETE FROM companies WHERE handle='gap'`);
    await db.query(`DELETE FROM companies WHERE handle='qlo'`);

    let results = await db.query(
        `INSERT INTO companies 
        (handle, name, num_employees, description, logo_url)
        VALUES ('gap', 'Gap Inc.', 40000, 'Clothing retailer', 'www.gap.com') 
        RETURNING handle, name`
    );
    testCompany = results.rows[0];

})

// ===============================
//   TESTS
// ===============================

describe("SAMPLE ROUTE", () => {
    test("SAMPLE TEST", async() => {
        expect(1+1).toBe(2);
    })
})

describe("GET /companies", () => {
    test("Gets all companies", async() => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(1);
        expect(res.body.companies).toContainEqual(testCompany);
    })
    test("Gets companies with params", async() => {
        const res = await request(app).get("/companies?search=gap");
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(1);
        expect(res.body.companies[0].handle).toEqual(testCompany.handle);
    })
    test("Gets 0 companies when params don't result in match", async() => {
        const res = await request(app).get("/companies?search=hello");
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(0);

    })
})

describe("POST /companies", () => {
    test("Adds new company to database", async() => {
        const newCo = {handle: "qlo", name:"uniqlo", num_employees:20000, description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newCo});
        expect(res.body.company).toEqual(newCo);
        expect(res.statusCode).toBe(201);
    })
    test("Doesn't add company when req body format is incorrect", async() => {
        const newBadCo = {handle: "qlo", name:"uniqlo", num_employees:"ten", description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newBadCo});
        expect(res.statusCode).toBe(400);
    })
    test("Doesn't add company when req body format is missing info", async() => {
        const newBadCo = {handle: "qlo", num_employees:"ten", description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newBadCo});
        expect(res.statusCode).toBe(400);
    })
})

describe("GET /companies/:handle", () => {
    test("Gets one company", async () => {
        const res = await request(app).get(`/companies/${testCompany.handle}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toEqual(testCompany.name);
    })
    test("Returns 404 when company doesn't exist", async() => {
        const res = await request(app).get(`/companies/fakeCompany`);
        expect(res.statusCode).toBe(404);
    })

})

describe("PATCH /companies/:handle", () => {
    test("Updates one company", async () => {
        const res = await request(app)
            .patch(`/companies/${testCompany.handle}`)
            .send({"company": {"name": "Old Navy"}})
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toEqual("Old Navy");
    })
    test("Returns 404 when company doesn't exist", async() => {
        const res = await request(app)
            .patch(`/companies/fakeCompany`)
            .send({"company": {"name": "Old Navy"}})
        expect(res.statusCode).toBe(404);
    })
    test("Returns error when req body is not formatted correctly", async() => {
        const res = await request(app)
        .patch(`/companies/${testCompany.handle}`)
        .send({"company": {num_employees: "twenty"}})
    })
})

describe("DELETE /companies/:handle", () => {
    test("Deletes one compay", async () => {
        const res = await request(app).delete(`/companies/${testCompany.handle}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toEqual("Company Gap Inc. deleted")
        
        const res2 = await request(app).get('/companies');
        expect(res2.body.companies).toHaveLength(0);
    })
    test("Returns 404 if company doesn't exist", async() => {
        const res = await request(app).delete("/companies/fakeCompany");
        expect(res.statusCode).toBe(404);
    })
})





// ===============================
//   TEST TEAR DOWN
// ===============================

afterEach(async () => {
    // delete company made in set up
    await db.query(`DELETE FROM companies WHERE handle='gap'`);
    await db.query(`DELETE FROM companies WHERE handle='qlo'`);

})

afterAll(async function() {
    // close db connection
    await db.end();
})