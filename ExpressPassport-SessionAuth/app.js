const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');

const index = require('./routes/index');
const userRouter = require('./routes/userRouter');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

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
app.use(session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session()); // Required for persistent login sessions
app.use(express.static(path.join(__dirname, 'public'))); // serves static data from public folder

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

function auth(req, res, next) {
    console.log(req.user);

    if (!req.user) {
        var err = new Error('You are not authenticated!');
        err.status = 403;
        next(err);
    }
    else {
        next();
    }
}

app.use('/', index);
app.use('/users', userRouter);

app.use(auth);
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
