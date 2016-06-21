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
var _ = require('underscore'),
    administrators = require('../settings/administrators'),
    Assets = require('../models/assets'),
    bitly = require('../models/bitly')(process.env.BITLY),
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
     * Number of requests allowed per phone number.
     * @type {number}
     */
    var limit = 21;
    /**
     * Random error response generator.
     * @returns {string}
     * @private
     */
    var _getRandomResponseForAnError = function () {
        var responses = ['This isn\'t the asset you are looking for.',
            'Ahh, hard to see, the Dark Side of an asset is.',
            'Remember...the Force will be with you, and your asset, always.',
            'Is it the asset that made the Kessel Run in less than twelve parsecs?'];
        return responses[Math.floor(Math.random() * responses.length)];
    };
    /**
     * Twilio error handler.
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
     * Twilio incoming request handler.
     * @param req
     * @param res
     *
     */
    var request = function (req, res) {
        var self = this;
        var header = req.headers['x-twilio-signature'];
        var twiml = new twilio.TwimlResponse();
        if (twilio.validateRequest(this.authToken, header, process.env.DOMAIN + req.originalUrl, req.body)) {
            var counter = parseInt(req.cookies.counter, 10) || 0;
            var phoneNumber = req.body.From;
            var isAdministrator = _.contains(administrators, phoneNumber);
            if (!isAdministrator && counter === limit) {
                res.cookie('counter', counter += 1);
                twiml.message('The circle is now complete.');
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
                return;
            }
            if (!isAdministrator && counter > limit) {
                twiml.message('Strike me down, and I will become more powerful than you could possibly imagine.');
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
                return;
            }
            res.cookie('counter', counter += 1);
            var assetId = req.cookies.assetId;
            var reply = req.body.Body.trim().toLowerCase();
            if (reply === '?' || reply.slice(0,4) === 'help') {
                twiml.message('Reply with the name of the asset you are looking for. Once found, reply with HEALTH, WHERE, or MORE to get further detail. Reply STOP to cancel.');
                res.writeHead(200, {
                    'Content-Type': 'text/xml'
                });
                res.end(twiml.toString());
                return;
            }
            var func = keywords[reply];
            if (assetId && func) {
                func.call(this, assetId)
                    .then(function (message) {
                        if (assetId === 'mi31' && reply === 'more') {
                            twiml.message(function () {
                                this.body(message.substr(0, 130));
                                this.media('http://sms.apricothill.com/content/bangui-windmills.gif');
                            });
                        } else {
                            twiml.message(message);
                        }
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    })
                    .fail(function (err) {
                        twiml.message(_getRandomResponseForAnError());
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    });
            } else {
                if (func) {
                    twiml.message('What asset are you looking for?');
                    res.writeHead(200, {
                        'Content-Type': 'text/xml'
                    });
                    res.end(twiml.toString());
                    return;
                }
                if (reply === 'count') {
                    twiml.message(counter.toString());
                    res.writeHead(200, {
                        'Content-Type': 'text/xml'
                    });
                    res.end(twiml.toString());
                    return;
                }
                assetId = reply;
                self.assets.getAssetLastUpdated(assetId)
                    .then(function (lastUpdated) {
                        if (lastUpdated) {
                            var template = '{{assetId}}\'s last checked in at {{lastUpdated}}';
                            twiml.message(new S(template).template({
                                assetId: assetId,
                                lastUpdated: lastUpdated
                            }).s);
                            res.cookie('assetId', assetId);
                        } else {
                            twiml.message('I couldn\'t find an asset with that name.');
                            res.clearCookie('assetId', { path: '/' });                         }
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    })
                    .fail(function (err) {
                        twiml.message(_getRandomResponseForAnError());
                        res.writeHead(200, {
                            'Content-Type': 'text/xml'
                        });
                        res.end(twiml.toString());
                    })
            }
        } else {
            res.writeHead(403);
            res.end();
        }
    };
    /**
     * Twilio status callback function for reporting.
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
    /**
     * Get the health score for an asset.
     * @param assetId
     * @returns {*}
     */
    function getAssetHealthScore(assetId) {
        if (assetId) {
            return this.assets.getAssetHealthScore(assetId)
                .then(function (healthScore) {
                    return healthScore || 'N/A';
                })
                .fail(function (err) {
                    return _getRandomResponseForAnError();
                })
        } else {
            var deferred = Q.defer();
            deferred.resolve('I couldn\'t find that asset.');
            return deferred.promise.nodeify(callback);
        }
    }
    /**
     * Get the asset's location.
     * @param assetId
     * @returns {*}
     */
    function getAssetLocation(assetId) {
        if (assetId) {
            return this.assets.getAssetLocation(assetId)
                .then(function (url) {
                    return url;
                })
                .fail(function (err) {
                    return _getRandomResponseForAnError();
                })
        } else {
            var deferred = Q.defer();
            deferred.resolve('Sorry, did you lose it?');
            return deferred.promise.nodeify(callback);
        }
    }
    /**
     * Get the asset's summary page.
     * @param assetId
     * @returns {*}
     */
    function getAssetSummary(assetId) {
        if (assetId) {
            return this.assets.getAssetSummary(assetId)
                .then(function (url) {
                    if (url.indexOf('spotify') === -1) {
                        return bitly.getShortUrl(url)
                            .then(function (shortUrl) {
                                return shortUrl;
                            });
                    } else {
                        return url;
                    }
                })
                .fail(function (err) {
                    return 'Can I get back to you?';
                })
        } else {
            var deferred = Q.defer();
            deferred.resolve('I think that asset is flying under the radar.');
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
