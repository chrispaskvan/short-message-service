/**
 * Created by chris on 8/23/15.
 */
'use strict';
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express');

var app = express();
var port = process.env.PORT || 1111;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
/**
 * Set Access Headers
 */
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-egen-solutions-idea');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
/**
 * Routes
 */
var notificationRouter = require('./routes/notificationRoutes')();
app.use('/api/notifications', notificationRouter);

var twilioRouter = require('./routes/twilioRoutes')();
app.use('/api/twilio', twilioRouter);

app.get('/ping', function (req, res) {
    res.json({pong: Date.now()});
});

app.listen(port, function init() {
    console.log('Gulp is running on port ' + port + '.');
});

module.exports = app;
