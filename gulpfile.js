'use strict';

// Include gulp
var gulp = require('gulp');

// Include plugins
var sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    autoprefixer = require('gulp-autoprefixer');

var conf = {
    css: {
        wrkPath: ['bower_components/reset/index.css', 'content/source/*.scss'],
        optPath: 'content/build/css',
        optName: 'all.css',
        optNameMin: 'all.min.css'
    },
    js: {
        wrkPath: [
            'bower_components/jquery/dist/jquery.js', 
            'bower_components/fastclick/lib/fastclick.js',
            'content/source/Store.js',
            'content/source/Cell.js', 
            'content/source/Game.js',
            'content/source/index.js'
        ],
        optPath: 'content/build/js',
        optName: 'all.js',
        optNameMin: 'all.min.js'
    },
    jade: {
        wrkPath: 'content/source/*.jade',
        optPath: 'content/build',
        optName: 'index.html'
    }
}

// Compile and minify css
gulp.task('css', function() {
    return gulp.src(conf.css.wrkPath)
        .pipe(sourcemaps.init())
        .pipe(concat(conf.css.optName))
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['> 1%', 'last 2 versions', 'IE 7'],
            cascade: false
        }))
        .pipe(gulp.dest(conf.css.optPath))
        .pipe(minify({
            advanced: false,
            compatibility: 'ie7'
        }))
        .pipe(rename(conf.css.optNameMin))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(conf.css.optPath));
});

// Minify js
gulp.task('js', function() {
    return gulp.src(conf.js.wrkPath)
        .pipe(concat(conf.js.optName))
        .pipe(gulp.dest(conf.js.optPath))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(rename(conf.js.optNameMin))
        .pipe(gulp.dest(conf.js.optPath));
});

// Compile jade
gulp.task('jade', function() {
    return gulp.src(conf.jade.wrkPath)
        .pipe(jade())
        .pipe(rename(conf.jade.optName))
        .pipe(gulp.dest(conf.jade.optPath));
});

// Watch files
gulp.task('watch', function() {
    gulp.watch(conf.css.wrkPath, ['css']);
    gulp.watch(conf.js.wrkPath, ['js']);
    gulp.watch(conf.jade.wrkPath, ['jade']);
});

// Default task
gulp.task('default', ['css', 'js', 'jade']);
