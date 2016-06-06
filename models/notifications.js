/**
 * A module for sending SMS/MMS notifications.
 *
 * @module Notifications
 * @summary Helper functions for using the Twilio client and recording sent messages.
 * @description Utility functions for submitting a SMS/MMS message with Twilio,
 * recording the message, and updating the message status.
 * @requires fs
 * @requires Q
 * @requires twilio
 */
var fs = require('fs'),
    Q = require('q'),
    twilio = require('twilio');
/**
 * @param twilioSettingsFullPath {string}
 * @returns {Notifications}
 * @constructor
 */
function Notifications(twilioSettingsFullPath) {
    'use strict';
    /**
     * @member {Object}
     * @type {{accountSid: string, authToken string, phoneNumber string}} settings
     */
    this.settings = JSON.parse(fs.readFileSync(twilioSettingsFullPath || './settings/twilio.production.json'));
    /**
     * Twilio Client
     * @type {twilio}
     */
    this.twilioClient = twilio(this.settings.accountSid, this.settings.authToken);
}
/**
 * @namespace
 * @type {{sendMessage}}
 */
Notifications.prototype = (function () {
    'use strict';
    /**
     * @param body {string}
     * @param to {string}
     * @param mediaUrl {string}
     * @returns {*}
     */
    var sendMessage = function (body, to, mediaUrl) {
        var deferred = Q.defer();
        var m = {
            to: to,
            from: this.settings.phoneNumber,
            body: body,
            statusCallback: process.env.DOMAIN + '/api/twilio/destiny/s'
        };
        if (mediaUrl) {
            m.mediaUrl = mediaUrl;
        }
        this.twilioClient.messages.create(m, function (err, message) {
            if (!err) {
                deferred.resolve(message);
            } else {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    };
    return {
        sendMessage: sendMessage
    };
}());
module.exports = Notifications;
