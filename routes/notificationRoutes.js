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
    notificationRouter.route('/assets/:assetId/:phoneNumber')
        .post(function (req, res) {
            notificationController.createNotificationForAssetByPhoneNumber(req, res);
        });
    return notificationRouter;
};

module.exports = routes;