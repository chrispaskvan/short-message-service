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
                    var template = 'http://www.google.com/maps/place/{{latitude}}+{{longitude}}/@{{latitude}},{{longitude}},{{zoom}}z';
                    _.extend(asset.currentState, { zoom: 17 });
                    return new S(template).template(asset.currentState).s;
                } else {
                    return undefined;
                }
            });
    };
    var getAssetHealthScore = function (assetId, callback) {
        return getAsset(assetId, callback)
            .then(function (asset) {
                return asset ? asset.currentState.Overall_Health : undefined;
            });
    };
    var getAssetLastUpdated = function (assetId, callback) {
        return getAsset(assetId, callback)
            .then(function (asset) {
                if (asset) {
                    if (asset.currentState.modifiedDate.constructor.name === 'String') {
                        var timeStamp = Date.parse(asset.currentState.modifiedDate);
                        return isNaN(timeStamp) ? undefined : new Date(timeStamp);
                    } else {
                        return asset.currentState.modifiedDate;
                    }
                }
                return undefined;
            });
    };
    var getAssetSummary = function (assetId, callback) {
        return getAsset(assetId, callback)
            .then(function (asset) {
                if (assetId === 'ozzie1980') {
                    return 'https://open.spotify.com/track/2b9lp5A6CqSzwOrBfAFhof'
                }
                if (assetId === 'mi31') {
                    return 'https://open.spotify.com/track/6RUpOheT93fUdI508K5w6U'
                }
                return asset ?
                    'http://www.uptake.com/?locomotive=' + asset.name
                    : undefined;
            });
    };
    function getAsset(assetId, callback) {
        var deferred = Q.defer();
        deferred.resolve(_.find(assets.content, function (asset) {
            return asset.name.toLowerCase() === assetId.toLowerCase();
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
