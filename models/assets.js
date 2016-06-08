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
        return getAsset(assetId, callback)
            .then(function (asset) {
                if (asset) {
                    var template = 'http://www.google.com/maps/preview/@{{latitude}},{{longitude}},{{zoom}}z';
                    _.extend(asset, { zoom: 17 });
                    return new S(template).template(asset).s;
                } else {
                    return undefined;
                }
            });
    };
    var getAssetHealthScore = function (assetId, callback) {
        return getAsset(assetId, callback)
            .then(function (asset) {
                return asset ? asset.healthScore : undefined;
            });
    };
    var getAssetLastUpdated = function (assetId, callback) {
        return getAsset(assetId, callback)
            .then(function (asset) {
                if (asset) {
                    if (asset.lastUpdated.constructor.name === 'String') {
                        var timeStamp = Date.parse(asset.lastUpdated);
                        return isNaN(timeStamp) ? undefined : new Date(timeStamp);
                    } else {
                        return asset.lastUpdated;
                    }
                }
                return undefined;
            });
    };
    var getAssetSummary = function (assetId, callback) {
        return getAsset(assetId, callback)
            .then(function (asset) {
                return asset ? asset.summary : undefined;
            });
    };
    function getAsset(assetId, callback) {
        var deferred = Q.defer();
        deferred.resolve(_.find(assets, function (asset) {
            return asset.assetId.toLowerCase() === assetId.toLowerCase();
        }));
        return deferred.promise.nodeify(callback);
    }
    return {
        getAssetLocation: getAssetLocation,
        getAssetHealthScore: getAssetHealthScore,
        getAssetLastUpdated: getAssetLastUpdated,
        getAssetSummary: getAssetSummary
    };
};
module.exports = Assets;
