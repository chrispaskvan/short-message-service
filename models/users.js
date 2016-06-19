/**
 * A module for user operations.
 */
'use strict';
var Q = require('q');

var Users = function () {
    var getUserByPhoneNumber = function getUserByPhoneNumber(phoneNumber, callback) {
        var deferred = Q.defer();
        deferred.resolve({
            userId: "1"
        });
        return deferred.promise.nodeify(callback);
    };
    return {
        getUserByPhoneNumber: getUserByPhoneNumber
    };
};
module.exports = Users;
