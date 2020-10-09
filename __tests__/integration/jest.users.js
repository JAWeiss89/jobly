process.env.NODE_ENV="test";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const db = require("../../db");
const secretKey = require("../../keys/keys")

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one user into test database

let testUser;
let testSameUserToken;
let testDiffUserToken;

beforeEach( async () => {
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    await db.query(`DELETE FROM users WHERE username='sarita111'`);
    let results = await db.query(
        `INSERT INTO users
        (username, password, first_name, last_name, email, photo_url, is_admin)
        VALUES ('jorgito', 'hashedpassword', 'jorge', 'weiss', 'jorge@jorge.com', 'www.image.com', false)
        RETURNING username, first_name, last_name, email`
    );
    testUser = results.rows[0]; 

    const testSameUser = { username: "jorgito", is_admin: false};
    const testDiffUser  = { username: "danielito", is_admin: false}
    testSameUserToken = jwt.sign(testSameUser, secretKey);
    testDiffUserToken = jwt.sign(testDiffUser, secretKey);
})

// ===============================
//   TESTS
// ===============================

describe("SAMPLE ROUTE", () => {
    test("SAMPLE TEST", async() => {
        expect(1+1).toBe(2);
    })
})

describe("GET /users", () => {
    // route does not need authentication
    test("Gets all users", async() => {
        const res = await request(app)
            .get("/users");
        expect(res.statusCode).toBe(200);
        expect(res.body.users).toHaveLength(1);
        expect(res.body.users).toContainEqual(testUser);
    })
})

describe("POST /users", () => {
    test("Adds new user to database", async() => {
        const newUser = {username: "sarita111", password:"mypassword", first_name:"Sarita", last_name:"Ramirez", email:"sara@sara@g.com", photo_url:"image.com", is_admin: false }
        const res = await request(app)
            .post("/users")
            .send({user: newUser});
        expect(res.body.token).toBeTruthy();
        expect(res.statusCode).toBe(201);
        const res2 = await request(app)
            .get("/users");
        expect(res2.statusCode).toBe(200);
        expect(res2.body.users).toHaveLength(2);
    })
    test("Does not add user if data sent is missing needed info", async() => {
        const newBadUser = {username: "sarita222", password:"hashedpw", last_name:"Ramirez", email:"sara@sara@g.com", photo_url:"image.com", is_admin: false }
        const res = await request(app)
        .post("/users")
        .send({user: newBadUser});
        expect(res.statusCode).toBe(400);
    })
})

describe("GET /users/:username", () => {
    test("Gets one user", async() => {
        const res = await request(app).get(`/users/${testUser.username}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.user.username).toEqual(testUser.username);
    })
    test("Returns 404 if can't find user", async() => {
        const res = await request(app).get(`/users/fakeuser`);
        expect(res.statusCode).toBe(404);
    })
})

describe("PATCH /users/:username", () => {
    test("Updates user details if same user is making request", async() => {
        const res = await request(app)
            .patch(`/users/${testUser.username}`)
            .send({user: {"first_name": "george"}, _token: testSameUserToken})
        expect(res.statusCode).toBe(200);
        expect(res.body.user.first_name).toEqual("george");
    })
    test("Does not update user details if different user is making request", async() => {
        const res = await request(app)
            .patch(`/users/${testUser.username}`)
            .send({user: {"first_name": "george"}, _token: testDiffUserToken})
        expect(res.statusCode).toBe(500);
    })
    test("Returns error if can't find user", async() => {
        const res = await request(app)
            .patch(`/users/fakeuser`)
            .send({user: {"first_name": "daniel"}, _token: testSameUserToken})
        expect(res.statusCode).toBe(500);
    })
})

describe("DELETE /users/:username", () => {
    test("Deletes specified user if same user is making request", async() => {
        const res = await request(app)
            .delete(`/users/${testUser.username}`)
            .send({_token: testSameUserToken});
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toEqual("User jorgito deleted");

        const res2 = await request(app).get("/users");
        expect(res2.body.users).toHaveLength(0);
    })
    test("Does not delete user if different user is making request", async() => {
        const res = await request(app)
            .delete(`/users/${testUser.username}`)
            .send({_token: testDiffUserToken});
        expect(res.statusCode).not.toBe(200);

        const res2 = await request(app)
            .get("/users");
        expect(res2.body.users).toHaveLength(1);
    })
})




// ===============================
//   TEST TEAR DOWN
// ===============================

afterEach(async () => {
    // delete company made in set up
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    await db.query(`DELETE FROM users WHERE username='sarita111'`);

})

afterAll(async function() {
    // close db connection
    await db.end();
})