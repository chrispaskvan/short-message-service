/**
 * A module for serving mock data.
 */
'use strict';
var _ = require('underscore'),
    assets = require('../mocks/assets.json'),
    Q = require('q'),
    S = require('string');

var Assets = function () {
    var getAssetLocation = function (assetId, callback) {
        var deferred = Q.defer();
        var asset = getAsset(assetId);
        if (asset) {
            var template = 'http://www.google.com/maps/preview/@{{latitude}},{{longitude}},{{zoom}}z';
            _.extend(asset, { zoom: 17 });
            deferred.resolve(new S(template).template(asset).s);
        } else {
            deferred.reject();
        }
        return deferred.promise.nodeify(callback);
    };
    var getAssetHealthScore = function (assetId, callback) {
        var deferred = Q.defer();
        var asset = getAsset(assetId);
        if (asset) {
            deferred.resolve(asset.healthScore);
        } else {
            deferred.reject();
        }
        return deferred.promise.nodeify(callback);
    };
    var getAssetLastUpdated = function (assetId, callback) {
        var deferred = Q.defer();
        var asset = getAsset(assetId);
        if (asset) {
            deferred.resolve(asset.lastUpdated);
        } else {
            deferred.reject();
        }
        return deferred.promise.nodeify(callback);
    };
    var getAssetSummary = function (assetId, callback) {
        var deferred = Q.defer();
        var asset = getAsset(assetId);
        if (asset) {
            deferred.resolve(asset.summary);
        } else {
            deferred.reject();
        }
        return deferred.promise.nodeify(callback);
    };
    function getAsset(assetId) {
        return _.find(assets, function (asset) {
            return asset.assetId.toLowerCase() === assetId.toLowerCase();
        });
    }
    return {
        getAssetLocation: getAssetLocation,
        getAssetHealthScore: getAssetHealthScore,
        getAssetLastUpdated: getAssetLastUpdated,
        getAssetSummary: getAssetSummary
    };
};
module.exports = Assets;
