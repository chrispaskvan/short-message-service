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
    Notifications = require('../models/notifications');

/**
 * @constructor
 */
function NotificationController() {
    'use strict';
    this.notifications = new Notifications(process.env.TWILIO);
}
/**
 * @namespace
 * @type {{createNotificationForAssetByPhoneNumber}}
 */
NotificationController.prototype = function () {
    'use strict';
    /**
     *
     * @param req
     * @param res
     */
    var createNotificationForAssetByPhoneNumber = function (req, res) {
        var self = this;
        var keys = _.keys(notificationHeaders);
        if (_.compact(_.map(keys, function (headerName) {
            return req.headers[headerName] === notificationHeaders[headerName];
        })).length !== keys.length) {
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
        var knownAssets = 'The following assets experienced a critical failure last night:\n' +
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
    return {
        createNotificationForAssetByPhoneNumber: createNotificationForAssetByPhoneNumber
    };
}();
module.exports = NotificationController;
