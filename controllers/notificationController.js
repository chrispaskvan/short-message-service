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
    fs = require('fs'),
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
        var assetId = req.params.assetId;
        /**
         * @todo Verify the user has permissions to receive notifications for the asset.
         */
        self.notifications.sendMessage('I\'m supposed to say something about ' +
            assetId + '. But why don\'t you just ask me?', phoneNumber)
            .then(function (message) {
                res.cookie('assetId', assetId);
                res.writeHead(200, {
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
