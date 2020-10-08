const db = require("../db");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");


class User {
    // static methods
    static async getAll () {
        const userResults = await db.query(
            `SELECT username, first_name, last_name, email FROM users`
        );
        const users = userResults.rows;
        return users;
    }

    static async getOne(username) {
        const results = await db.query(
            `SELECT * FROM users WHERE username=$1`, [username]
        )
        if (results.rows.length===0) {
            throw new ExpressError(`Could not find a user with username ${username}.`, 404)
        }
        return results.rows[0];
    }

    static async create(newUserObj) {

        const { username, first_name, last_name, email, photo_url, is_admin } = newUserObj;
        const password = "placeholder";

        const result = await db.query(
            `INSERT INTO users 
            (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, first_name, last_name, email, photo_url, is_admin`, 
            [username, password, first_name, last_name, email, photo_url, is_admin]
        )
        return result.rows[0];
    }

    static async update(username, userData) {
        const {query, values} = partialUpdate('users', userData, 'username', username);

        const result = await db.query(query, values);
        if (result.rows.length==0) {
        throw new ExpressError(`Could not find user with username ${username}`, 404);
    }
    return result.rows[0];
    }

    static async delete(username) {
        const results = await db.query(
            `DELETE FROM users WHERE username=$1 RETURNING username`, [username]
        )
        if (results.rows.length==0) {
            throw new ExpressError(`Could not find user with username ${username}`, 404);
        }
        return results.rows[0];
    }

}

module.exports = User;