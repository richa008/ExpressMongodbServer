var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connection URL
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

function auth(request, response, next) {
    console.log(request.headers);
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        const error = new Error("You are not authenticated");
        response.setHeader("WWW-Authenticate", "Basic");
        error.status = 401;
        return next(error);
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(":");
    const userName = auth[0];
    const password = auth[1];

    if (userName === "admin" && password === "password") {
        next();
    } else {
        const error = new Error("You are not authenticated");
        response.setHeader("WWW-Authenticate", "Basic");
        error.status = 401;
        return next(error);
    }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public'))); // serves static data from public folder

app.use('/', index);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function (request, response, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, request, response, next) {
    // set locals, only providing error in development
    response.locals.message = err.message;
    response.locals.error = request.app.get('env') === 'development' ? err : {};

    // render the error page
    response.status(err.status || 500);
    response.render('error');
});

module.exports = app;
