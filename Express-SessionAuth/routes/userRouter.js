const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require("../models/user");
const passport = require('passport');

router.use(bodyParser.json());

function showError(next, message) {
    const error = new Error(message);
    error.status = 403;
    return next(error);
}

router.post("/signup", (req, res, next) => {
    User.register(new User({ username: req.body.username }),
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });
            }
            else {
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Registration Successful!' });
                });
            }
        });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'You are successfully logged in!' });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
