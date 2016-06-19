/**
 * A module for sending user notifications.
 *
 * @module notificationController
 * @author Chris Paskvan
 * @requires _
 * @requires fs
 * @requires Notifications
 * @requires path
 * @requires Q
 */
var _ = require('underscore'),
    notificationHeaders = require('../settings/notificationHeaders.json'),
    Notifications = require('../models/notifications')
    Users = require('../models/users');

/**
 * @constructor
 */
function NotificationController() {
    'use strict';
    this.keys = _.keys(notificationHeaders);
    this.notifications = new Notifications(process.env.TWILIO);
    this.users = new Users();
}
/**
 * @namespace
 * @type {{createNotificationForAssetByPhoneNumber}}
 */
NotificationController.prototype = function () {
    'use strict';
    /**
     * Send a message notifying of the asset(s) recent failure.
     * @param req
     * @param res
     */
    var createFailureNotificationForAssetsByPhoneNumber = function (req, res) {
        var self = this;
        if (!areNotificationRequestHeadersValid.call(self, req)) {
            res.writeHead(403);
            res.end();
            return;
        }
        var phoneNumber = req.params.phoneNumber;
        /**
         * @todo Verify the phone number belongs to a registered user.
         */
        var assets = req.body.assets;
        /**
         * @todo Verify the user has permissions to receive notifications for the asset.
         */
        var knownAssets = 'The following assets recently experienced critical failures:\n' +
            _.map(assets, function (asset) {
                return asset.assetId;
            }).join('\n');
        self.notifications.sendMessage(knownAssets, phoneNumber)
            .then(function (message) {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end();
            })
            .fail(function (err) {
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.end();
            });
    };
    var createFenceNotificationForAssetsByPhoneNumber = function (req, res) {
        var self = this;
        if (!areNotificationRequestHeadersValid.call(this, req)) {
            res.writeHead(403);
            res.end();
            return;
        }
        var phoneNumber = req.params.phoneNumber;
        getUser.call(self, cleanPhoneNumber(phoneNumber))
            .then(function (user) {
                if (!user) {
                    res.writeHead(403);
                    res.end();
                    return;
                }
                var assets = req.body.assets;
                _.each(assets, function (asset) {
                    if (!isUserPermittedToViewAsset(user.userId, asset.assetId)) {
                        res.writeHead(403);
                        res.end();
                        return;
                    }
                });
                var knownAssets = 'The following assets just entered \'Naperville Rail Yard\':\n' +
                    _.map(assets, function (asset) {
                        return asset.assetId;
                    }).join('\n');
                self.notifications.sendMessage(knownAssets, phoneNumber)
                    .then(function (message) {
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end();
                    })
                    .fail(function (err) {
                        res.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        res.end();
                    });
            })
            .fail(function (err) {
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.end();
            });
    };
    /**
     *
     * @param req
     * @returns {boolean}
     */
    function areNotificationRequestHeadersValid(req) {
        return _.compact(_.map(this.keys, function (headerName) {
            return req.headers[headerName] === notificationHeaders[headerName];
        })).length === this.keys.length;
    }
    /**
     *
     * @param phoneNumber
     * @returns {*}
     */
    function cleanPhoneNumber(phoneNumber) {
        var cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
        return cleanedPhoneNumber.length === 11 && cleanedPhoneNumber[0] === "1" ?
            cleanedPhoneNumber.slice(1) : cleanedPhoneNumber;
    }
    /**
     *
     * @todo Verify the phone number belongs to a registered user.
     */
    function getUser(phoneNumber) {
        return this.users.getUserByPhoneNumber(cleanPhoneNumber(phoneNumber))
            .then(function (user) {
                return user;
            });
    }
    /**
     * @todo Verify the user has permissions to receive notifications for the asset.
     */
    function isUserPermittedToViewAsset(userId, assetId) {
        return userId === "1" && assetId !== "LOCOMOTIVE_BNSF8404";
    }
    return {
        createFailureNotificationForAssetsByPhoneNumber: createFailureNotificationForAssetsByPhoneNumber,
        createFenceNotificationForAssetsByPhoneNumber: createFenceNotificationForAssetsByPhoneNumber
    };
}();
module.exports = NotificationController;
