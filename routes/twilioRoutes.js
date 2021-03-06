/**
 * Twilio inbound and outbound request URLs. See the article
 * at {@link https://twilio.radicalskills.com/projects/getting-started-with-twiml/1.html}
 * for instructions on how to debug these routes locally. Remember
 * to update the DOMAIN environment variable.
 */
var express = require('express'),
    TwilioController = require('../controllers/twilioController');

var routes = function () {
    'use strict';
    var twilioRouter = express.Router();
    var twilioController = new TwilioController();
    twilioRouter.route('/r')
        .post(function (req, res) {
            twilioController.request(req, res);
        });
    twilioRouter.route('/s')
        .post(function (req, res) {
            twilioController.statusCallback(req, res);
        });
    twilioRouter.route('/f')
        .post(function (req, res) {
            twilioController.fallback(req, res);
        });
    return twilioRouter;
};

module.exports = routes;
