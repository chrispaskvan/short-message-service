'use strict';
var env = require('gulp-env'),
    gulp = require('gulp'),
    nodemon = require('gulp-nodemon');

gulp.task('default', function runDefault() {
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: {
            DOMAIN: 'http://9ffd3553.ngrok.io',
            PORT: 1111,
            TWILIO: './settings/twilio.development.json'
        },
        ignore: ['./node_modules/**']
    }).on('restart', function restart() {
        console.log('Restarting ...');
    });
});
