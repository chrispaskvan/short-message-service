var express = require('express'),
    NotificationController = require('../controllers/notificationController');

var routes = function () {
    'use strict';
    var notificationRouter = express.Router();
    /**
     * Initialize the controller.
     * @type {notificationController|exports|module.exports}
     */
    var notificationController = new NotificationController();
    /**
     * Routes
     */
    notificationRouter.route('/assets/:phoneNumber/failure')
        .post(function (req, res) {
            notificationController.createFailureNotificationForAssetsByPhoneNumber(req, res);
        });
    notificationRouter.route('/assets/:phoneNumber/fence')
        .post(function (req, res) {
            notificationController.createFenceNotificationForAssetsByPhoneNumber(req, res);
        });
    return notificationRouter;
};

module.exports = routes;