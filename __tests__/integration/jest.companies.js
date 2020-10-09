process.env.NODE_ENV="test";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const db = require("../../db");
const secretKey = require("../../keys/keys");

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one company into test database

let testCompany;
let testUserToken;
let testAdminToken;



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

    const testNormalUser = { username: "user123", is_admin: false};
    const testAdminUser  = { username: "user456", is_admin: true}
    testUserToken = jwt.sign(testNormalUser, secretKey);
    testAdminToken = jwt.sign(testAdminUser, secretKey);


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
        const res = await request(app)
            .get("/companies")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(1);
        expect(res.body.companies).toContainEqual(testCompany);
    })
    test("Gets companies with params", async() => {
        const res = await request(app)
            .get("/companies?search=gap")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(1);
        expect(res.body.companies[0].handle).toEqual(testCompany.handle);
    })
    test("Gets 0 companies when params don't result in match", async() => {
        const res = await request(app)
            .get("/companies?search=hello")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(0);

    })
    test("Gets companies while handling unexpected params", async() => {
        const res = await request(app)
            .get("/companies?srch=gap")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.companies).toHaveLength(1);
        expect(res.body.companies[0].handle).toEqual(testCompany.handle);
    })
})

describe("POST /companies", () => {
    test("Adds new company to database if admin", async() => {
        const newCo = {handle: "qlo", name:"uniqlo", num_employees:20000, description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newCo, _token: testAdminToken});
        expect(res.body.company).toEqual(newCo);
        expect(res.statusCode).toBe(201);
    })
    test("Does not add company to database if not admin", async() => {
        const newCo = {handle: "qlo", name:"uniqlo", num_employees:20000, description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newCo, _token: testUserToken});
        expect(res.statusCode).toBe(401);
    })
    test("Doesn't add company when req body format is incorrect", async() => {
        const newBadCo = {handle: "qlo", name:"uniqlo", num_employees:"ten", description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newBadCo, _token: testAdminToken});
        expect(res.statusCode).toBe(400);
    })
    test("Doesn't add company when req body format is missing info", async() => {
        const newBadCo = {handle: "qlo", num_employees:"ten", description: " Japanese clothing retailer", logo_url:"www.uniqlo.com"}
        const res = await request(app)
            .post("/companies")
            .send({company: newBadCo, _token: testAdminToken});
        expect(res.statusCode).toBe(400);
    })
})

describe("GET /companies/:handle", () => {
    test("Gets one company if authenticated", async () => {
        const res = await request(app)
            .get(`/companies/${testCompany.handle}`)
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toEqual(testCompany.name);
    })
    test("Returns error if user not authenticated", async() => {
        const res = await request(app)
            .get(`/companies/${testCompany.handle}`)
            .send({_token: "fakeToken"});
        expect(res.statusCode).toBe(500);      
    })
    test("Returns 404 when company doesn't exist", async() => {
        const res = await request(app)
            .get(`/companies/fakeCompany`)
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(404);
    })

})

describe("PATCH /companies/:handle", () => {
    test("Updates one company if admin", async () => {
        const res = await request(app)
            .patch(`/companies/${testCompany.handle}`)
            .send({"company": {name: "Old Navy"}, _token: testAdminToken})
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toEqual("Old Navy");
    })
    test("Does not update one company if not admin", async () => {
        const res = await request(app)
            .patch(`/companies/${testCompany.handle}`)
            .send({"company": {name: "Old Navy"}, _token: testUserToken})
        expect(res.statusCode).toBe(401);

    })
    test("Returns 404 when company doesn't exist", async() => {
        const res = await request(app)
            .patch(`/companies/fakeCompany`)
            .send({"company": {"name": "Old Navy"}, _token: testAdminToken})
        expect(res.statusCode).toBe(404);
    })
    test("Returns error when req body is not formatted correctly", async() => {
        const res = await request(app)
        .patch(`/companies/${testCompany.handle}`)
        .send({"company": {num_employees: "twenty"}, _token: testAdminToken})
    })
})

describe("DELETE /companies/:handle", () => {
    test("Deletes one company", async () => {
        const res = await request(app)
            .delete(`/companies/${testCompany.handle}`)
            .send({_token: testAdminToken})

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toEqual("Company Gap Inc. deleted")
        
        const res2 = await request(app)
            .get('/companies')
            .send({_token: testAdminToken});
        expect(res2.body.companies).toHaveLength(0);
    })
    test("Returns 404 if company doesn't exist", async() => {
        const res = await request(app)
            .delete("/companies/fakeCompany")
            .send({_token: testAdminToken})
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