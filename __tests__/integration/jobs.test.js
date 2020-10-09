process.env.NODE_ENV="test";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const db = require("../../db");
const secretKey = require("../../keys/keys");

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one company AND one job into test database 

let testJob;
let testUserToken;
let testAdminToken;

beforeEach( async () => {
    await db.query(`DELETE FROM companies WHERE handle='gap'`);
    await db.query(`DELETE FROM jobs WHERE company_handle='gap'`);


    let companyResults = await db.query(
        `INSERT INTO companies 
        (handle, name, num_employees, description, logo_url)
        VALUES ('gap', 'Gap Inc.', 40000, 'Clothing retailer', 'www.gap.com') 
        RETURNING handle, name`
    );
    let jobResults = await db.query(
        `INSERT INTO jobs
        (title, salary, equity, company_handle, date_posted)
        VALUES ('QA Analyst', 80000, 0.1, 'gap', '2020-10-02')
        RETURNING *`
    )
    testJob = jobResults.rows[0];

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

describe("GET /jobs", () => {
    test("Gets all jobs if authenticated", async() => {
        const res = await request(app)
            .get("/jobs")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.jobs).toHaveLength(1);
        expect(res.body.jobs[0].title).toEqual(testJob.title);
    })
    test("Does not get jobs if not authenticated", async() => {
        const res = await request(app)
            .get("/jobs")
            .send({_token: "fakeToken"});
        expect(res.statusCode).toBe(500);
    })
    test("Gets jobs with params", async() => {
        const res = await request(app)
            .get("/jobs?search=analyst")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.jobs).toHaveLength(1);
        expect(res.body.jobs[0].title).toEqual(testJob.title);
    })
    test("Gets jobs with params resulting in zero matches", async() => {
        const res = await request(app)
            .get("/jobs?search=sales")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.jobs).toHaveLength(0);
    })
})

describe("POST /jobs", () => {
    test("Adds new job to database when user is admin, json sent is correctly formatted and company exists in db", async() => {
        const newJob = {title: "Software Developer", salary:100000, equity:0.2, company_handle: 'gap'}
        const res = await request(app)
            .post("/jobs")
            .send({job: newJob, _token: testAdminToken})
        expect(res.body.job.title).toEqual(newJob.title);
        expect(res.statusCode).toBe(201);
    })
    test("Does not add job if not admin", async () => {
        const newJob = {title: "Software Developer", salary:100000, equity:0.2, company_handle: 'gap'}
        const res = await request(app)
            .post("/jobs")
            .send({job: newJob, _token: testUserToken})
        expect(res.statusCode).toBe(401);
    })
    test("Does not add job if company does not exist", async () => {
        const newJob = {title: "Software Developer", salary:100000, equity:0.2, company_handle: 'target'}
        const res = await request(app)
            .post("/jobs")
            .send({job: newJob, _token: testAdminToken})
        expect(res.statusCode).toBe(500);
    })
    test("Does not add job if missing key information", async() => {
        const newJob = {salary:100000, equity:0.2, company_handle: 'gap'}
        const res = await request(app)
            .post("/jobs")
            .send({job: newJob, _token: testAdminToken})
        expect(res.statusCode).toBe(400);
    })
});

describe("GET /jobs/:id", () => {
    test("Gets one job", async() => {
        const res = await request(app)
            .get(`/jobs/${testJob.id}`)
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.job.title).toEqual(testJob.title);
    })
    test("Returns 404 if job does not exist", async() => {
        const res = await request(app)
            .get("/jobs/10000")
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(404);
    })
})

describe("PATCH /jobs/:id", () => {
    test("Updates job correctly", async() => {
        const changes = {title: "Web Developer", salary: 200000};
        const res = await request(app)
            .patch(`/jobs/${testJob.id}`)
            .send({job: changes, _token: testAdminToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.job.title).toEqual(changes.title);
        expect(res.body.job.company_handle).toEqual('gap');
    })
    test("Doesnt not job if not admin", async() => {
        const changes = {title: "Web Developer", salary: 200000};
        const res = await request(app)
            .patch(`/jobs/${testJob.id}`)
            .send({job: changes, _token: testUserToken});
        expect(res.statusCode).toBe(401);
    })
    test("Returns 404 if job id does not exist", async() => {
        const changes = {title: "Web Developer", salary: 200000};
        const res = await request(app)
            .patch(`/jobs/10000`)
            .send({job: changes, _token: testAdminToken});
        expect(res.statusCode).toBe(404);
    })
    test("Returns error if sent data is not as expected", async() => {
        const changes = {title: 40000, salary: "120000"};
        const res = await request(app)
            .patch(`/jobs/${testJob.id}`)
            .send({job: changes, _token: testAdminToken});
        expect(res.statusCode).toBe(400);
    })
})
describe("DELETE /jobs/:id", () => {
    test("Returns 404 if job doesn't exist", async() => {
        const res = await request(app)
            .delete("/jobs/1234")
            .send({_token: testAdminToken});
        expect(res.statusCode).toBe(404);
    })
    test("Deletes job that exists if admin", async() => {
        const res = await request(app)
            .delete(`/jobs/${testJob.id}`)
            .send({_token: testAdminToken});
        expect(res.statusCode).toBe(200);

        const res2 = await request(app)
            .get("/jobs")
            .send({_token: testAdminToken});
        expect(res2.body.jobs).toHaveLength(0);
    })
    test("Does not delete job if not admin", async() => {
        const res = await request(app)
            .delete(`/jobs/${testJob.id}`)
            .send({_token: testUserToken});
        expect(res.statusCode).toBe(401);

        const res2 = await request(app)
            .get("/jobs")
            .send({_token: testUserToken});
        expect(res2.body.jobs).toHaveLength(1);
    })
})

// ===============================
//   TEST TEAR DOWN
// ===============================

afterEach(async () => {
    // delete company made in set up
    await db.query(`DELETE FROM companies WHERE handle='gap'`);
    await db.query(`DELETE FROM jobs WHERE company_handle='gap'`);

})

afterAll(async function() {
    // close db connection
    await db.end();
})