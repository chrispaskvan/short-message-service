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
     * Send a SMS message.
     * @param body {string}
     * @param to {string}
     * @param mediaUrl {string}
     * @returns {*}
     */
    var sendMessage = function (body, to, mediaUrl) {
        var deferred = Q.defer();
        var phoneNumber = cleanPhoneNumber(to);
        if (!isPhoneNumberValid(phoneNumber)) {
            deferred.reject("Phone number is invalid.")
        }
        phoneNumber = phoneNumber.replace (/^/,'+1');
        var m = {
            to: phoneNumber,
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
    /**
     * Get the phone number in a 10 digit format.
     * @param phoneNumber
     * @returns {string}
     * @private
     */
    function cleanPhoneNumber(phoneNumber) {
        var cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
        return cleanedPhoneNumber.length === 11 && cleanedPhoneNumber[0] === "1" ?
            cleanedPhoneNumber.slice(1) : cleanedPhoneNumber;
    };
    /**
     * Validate the phone number.
     * @param phoneNumber
     * @returns {boolean}
     */
    function isPhoneNumberValid(phoneNumber) {
        return phoneNumber.length === 10;
    }
    return {
        sendMessage: sendMessage
    };
}());
module.exports = Notifications;
