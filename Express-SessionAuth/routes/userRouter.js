const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require("../models/user");

router.use(bodyParser.json());

function showAuthError(response, next, message) {
    const error = new Error("You are not authenticated");
    response.setHeader("WWW-Authenticate", "Basic");
    error.status = 401;
    return next(error);
}

function showError(next, message) {
    const error = new Error(message);
    error.status = 403;
    return next(error);
}

router.post("/signup", (request, response, next) => {
    User.findOne({ username: request.body.username })
        .then((user) => {
            if (user !== null) {
                showError(next, `User ${request.body.username} already exists`);
            } else {
                return User.create({
                    username: request.body.username,
                    password: request.body.password
                })
            }
        })
        .then(() => {
            response.statusCode = 200;
            response.setHeader("Content-type", "application/json");
            response.json({ status: "Registration successful!" });
        })
        .catch((error) => next(error));
});

router.post("/login", (request, response, next) => {

    if (!request.session.user) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            showAuthError(response, next);
        }

        const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(":");
        const username = auth[0];
        const password = auth[1];

        User.findOne({ username: username })
            .then((user) => {
                if (user === null) {
                    showError(next, `User ${username} not found`);
                } else if (user.password !== password) {
                    showError(next, "Passwords do not match");
                } else {
                    request.session.user = 'authenticated';
                    response.statusCode = 200;
                    response.setHeader("Content-type", "application/json");
                    response.end("You are authenticated");
                }
            })
            .catch((error) => next(error));
    }
    else {

        response.statusCode = 200;
        response.setHeader("Content-type", "application/json");
        response.end("You are already authenticated");
    }
});

router.get("/logout", (request, response, next) => {
    if (request.session) {
        request.session.destroy();
        response.clearCookie("session-id");
        response.redirect("/");
    } else {
        showError(next, "You are not logged in");
    }
});

module.exports = router;
