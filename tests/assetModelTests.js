'use strict';
var chai = require('chai'),
    expect = chai.expect,
    Assets = require('../models/assets');

chai.use(require('chai-string'));

var assets = new Assets();

describe('Get information about a known asset', function () {
    it('Should return a URL to the asset\'s summary page', function (done) {
        var assetId = 'BNSF8401';
        assets.getAssetSummary(assetId)
            .then(function (url) {
                expect(url).to.startsWith('http');
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });

    it('Should return a URL to Google Maps', function (done) {
        var assetId = 'BNSF8401';
        assets.getAssetLocation(assetId)
            .then(function (url) {
                expect(url).to.have.string('www.google.com/maps/');
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });

    it('Should return a date', function (done) {
        var assetId = 'BNSF8401';
        assets.getAssetLastUpdated(assetId)
            .then(function (lastUpdated) {
                console.log(lastUpdated.constructor.name);
                expect(lastUpdated instanceof Date).to.be.true;
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });

    it('Should return a date', function (done) {
        var assetId = 'BNSF8401';
        assets.getAssetHealthScore(assetId)
            .then(function (healthScore) {
                expect(healthScore).to.not.be.NaN;
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });
});
