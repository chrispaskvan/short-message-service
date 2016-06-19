'use strict';
var env = require('gulp-env'),
    gulp = require('gulp'),
    gulpMocha = require('gulp-mocha'),
    nodemon = require('gulp-nodemon');

gulp.task('default', function runDefault() {
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: {
            DOMAIN: 'http://d5aef042.ngrok.io',
            PORT: 1111,
            TWILIO: './settings/twilio.development.json'
        },
        ignore: ['./node_modules/**']
    }).on('restart', function restart() {
        console.log('Restarting ...');
    });
});

gulp.task('tests', function runTests() {
    env({ vars: {
        DOMAIN: 'http://d5aef042.ngrok.io',
        PORT: 1111,
        TWILIO: './settings/twilio.development.json'
    }});
    gulp.src('tests/*Tests.js', { read: false })
        .pipe(gulpMocha({ reporter: 'nyan' }));
});
