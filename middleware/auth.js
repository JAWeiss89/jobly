const jwt = require("jsonwebtoken");
const secretKey = require("../keys/keys");
const ExpressError = require("../helpers/expressError");


function authenticateJWT(req, res, next) {
    try {
        if (req.body._token) { // This middleware will run on every route so authentication of JWT will be attempted only if user is sending token
            const token = req.body._token;
            const payload = jwt.verify(token, secretKey);
            req.user = payload; // Since jwt has been verified, we add user key to request
            
        }
        return next();
    } catch(err) {
        next(err);
    }
}

function ensureLoggedIn(req, res, next) {
    if (req.user) {
        return next();
    } else {
        const logInErr = new ExpressError("Please log-in to proceed", 401);
        return next(logInErr);
    }
}

function ensureAdmin(req, res, next) {
    if (req.user.is_admin) {
        return next();
    } else {
        const adminErr = new ExpressError("Only admins can access this page", 401);
        return next(adminErr);
    }
}

function ensureSameUser(req, res, next) {
    if (req.user.username === req.params.username) {
        return next();
    } else {
        const incorrectUserErr = new ExpressError("You are not authorized to modify this user");
        return next(incorrectUserErr);
    }
}

module.exports = { authenticateJWT, ensureLoggedIn, ensureAdmin, ensureSameUser }