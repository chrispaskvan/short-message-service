'use strict';
var chai = require('chai'),
    expect = chai.expect,
    Assets = require('../models/assets');

chai.use(require('chai-string'));

var assets = new Assets();

var assetId = 'BNSF8401';
describe('Get information about a known asset', function () {
    it('Should return a URL to the asset\'s summary page', function (done) {
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

var unknownAssetId = '__PHANTOM__LOCOMOTIVE__';
describe('Get information about an unknown asset', function () {
    it('Should not return a URL to the asset\'s summary page', function (done) {
        assets.getAssetSummary(unknownAssetId)
            .then(function (url) {
                expect(url).to.be.undefined;
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });

    it('Should not return a URL to Google Maps', function (done) {
        assets.getAssetLocation(unknownAssetId)
            .then(function (url) {
                expect(url).to.be.undefined;
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });

    it('Should not return a date', function (done) {
        assets.getAssetLastUpdated(unknownAssetId)
            .then(function (lastUpdated) {
                expect(lastUpdated).to.be.undefined;
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });

    it('Should not return a health score', function (done) {
        assets.getAssetHealthScore(unknownAssetId)
            .then(function (healthScore) {
                expect(healthScore).to.be.undefined;
                done();
            })
            .fail(function (err) {
                done(err);
            });
    });
});
