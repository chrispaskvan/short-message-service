/**
 * A module for handling Twilio requests and responses.
 *
 * @module twilioController
 * @requires _
 * @requires fs
 * @requires Q
 * @requires S
 * @requires twilio
 */
var Assets = require('../models/assets'),
    fs = require('fs'),
    Q = require('q'),
    S = require('string'),
    twilio = require('twilio');
/**
 * @constructor
 */
function TwilioController() {
    'use strict';
    /**
     * Assets Model
     * @type {Assets|exports|module.exports}
     */
    this.assets = new Assets();
    /**
     * @member {Object}
     * @type {{accountSid: string, authToken string, phoneNumber string}} settings
     */
    this.authToken = JSON.parse(fs.readFileSync(process.env.TWILIO || './settings/twilio.production.json')).authToken;
}
/**
 * @namespace
 * @type {{fallback, request, statusCallback}}
 */
TwilioController.prototype = (function () {
    'use strict';
    var keywords = {
        health: getAssetHealthScore,
        where: getAssetLocation,
        more: getAssetSummary
    };
    /**
     *
     * @param req
     * @param res
     */
    var fallback = function (req, res) {
        var header = req.headers['x-twilio-signature'];
        var twiml = new twilio.TwimlResponse();
        if (twilio.validateRequest(this.authToken, header, process.env.DOMAIN + req.originalUrl, req.body)) {
            twiml.message('A failure occurred!');
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
        } else {
            res.writeHead(403, {
                'Content-Type': 'text/xml'
            });
        }
        res.end(twiml.toString());
    };
    /**
     *
     * @param req
     * @param res
     */
    var request = function (req, res) {
        var self = this;
        var header = req.headers['x-twilio-signature'];
        var twiml = new twilio.TwimlResponse();
        if (twilio.validateRequest(this.authToken, header, process.env.DOMAIN + req.originalUrl, req.body)) {
            var counter = parseInt(req.cookies.counter, 10) || 0;
            counter = counter + 1;
            res.cookie('counter', counter);
            var assetId = req.cookies.assetId;
            var message = req.body.Body.trim().toLowerCase();
            var func = keywords[message];
            if (!func) {
                assetId = message;
                self.assets.getAssetHealthScore(assetId)
                    .then(function (healthScore) {
                        return self.assets.getAssetLastUpdated(assetId)
                            .then(function (lastUpdated) {
                                var template = '{{assetId}}\'s last recorded health score was {{healthScore}} at {{lastUpdated}}';
                                twiml.message(new S(template).template({
                                    assetId: assetId,
                                    healthScore: healthScore,
                                    lastUpdated: lastUpdated
                                }).s);
                                res.cookie('assetId', assetId);
                                res.writeHead(200, {
                                    'Content-Type': 'text/xml'
                                });
                                res.end(twiml.toString());
                            });
                    })
                    .fail(function (err) {
                        twiml.message('These aren\'t the droids you are looking for. I mean assets.');
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    })
            } else {
                func.call(this, assetId)
                    .then(function (message) {
                        twiml.message(message);
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    })
                    .fail(function (err) {
                        twiml.message('These aren\'t the droids you are looking for. I mean assets.');
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    });
            }
        } else {
            res.writeHead(403);
            res.end();
        }
    };
    /**
     *
     * @param req
     * @param res
     */
    var statusCallback = function (req, res) {
        var header = req.headers['x-twilio-signature'];
        var twiml = new twilio.TwimlResponse();
        if (twilio.validateRequest(this.authToken, header, process.env.DOMAIN + req.originalUrl, req.body)) {
            this.notifications.updateMessage(JSON.stringify(req.body));
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
        } else {
            res.writeHead(403, {
                'Content-Type': 'text/xml'
            });
        }
        res.end(twiml.toString());
    };
    function getAssetHealthScore(assetId) {
        if (assetId) {
            return this.assets.getAssetHealthScore(assetId)
                .then(function (healthScore) {
                    return healthScore;
                })
                .fail(function (err) {
                    return 'These aren\'t the droids you are looking for. I mean assets.';
                })
        } else {
            var deferred = Q.defer();
            deferred.resolve('Sorry. I\'m not sure to who you are referring.');
            return deferred.promise.nodeify(callback);
        }
    }
    function getAssetLocation(assetId) {
        if (assetId) {
            return this.assets.getAssetLocation(assetId)
                .then(function (url) {
                    return url;
                })
                .fail(function (err) {
                    return 'These aren\'t the droids you are looking for. I mean assets.';
                })
        } else {
            var deferred = Q.defer();
            deferred.resolve('Sorry. I\'m not sure to who you are referring.');
            return deferred.promise.nodeify(callback);
        }
    }
    function getAssetSummary(assetId) {
        if (assetId) {
            return this.assets.getAssetSummary(assetId)
                .then(function (url) {
                    return url;
                })
                .fail(function (err) {
                    return 'Let me get back to you.';
                })
        } else {
            var deferred = Q.defer();
            deferred.resolve('Sorry. I\'m not sure to who you are referring.');
            return deferred.promise.nodeify(callback);
        }
    }
    return {
        fallback: fallback,
        request: request,
        statusCallback: statusCallback
    };
}());
module.exports = TwilioController;
