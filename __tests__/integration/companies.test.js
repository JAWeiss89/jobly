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
    // await db.query(`DELETE FROM companies WHERE handle='gap'`);

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
})

describe("POST /companies", () => {
    test("Adds new company to database", async() => {
        const newCo = {handle: "qlo", name:"uniqlo", num_employees:20000, description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newCo});
        expect(res.body.company).toEqual(newCo)
        expect(res.statusCode).toBe(201);
            
    })
})

describe("GET /companies/:handle", () => {
    test("Gets one company", async () => {
        const res = await request(app).get(`/companies/${testCompany.handle}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toEqual(testCompany.name);
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
})

describe("DELETE /companies/:handle", () => {
    test("Deletes one compay", async () => {
        const res = await request(app).delete(`/companies/${testCompany.handle}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toEqual("Company Gap Inc. deleted")
        
        const res2 = await request(app).get('/companies');
        expect(res2.body.companies).toHaveLength(0);
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