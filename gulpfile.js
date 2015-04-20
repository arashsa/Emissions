var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gutil = require('gulp-util');
var glob = require('glob');
var livereload = require('gulp-livereload');
var jasminePhantomJs = require('gulp-jasmine2-phantomjs');
var babelify = require("babelify");


// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [];

var browserifyTask = function (options) {
    //process.env.BROWSERIFYSHIM_DIAGNOSTICS=1

    // Our app bundler
    var appBundler = browserify({
        entries: [options.src], // Only need initial file, browserify finds the rest
        //debug: true, // Gives us sourcemapping
        debug: options.development, // Gives us sourcemapping
        cache: {},
        packageCache: {},
        fullPaths: options.development // Requirement of watchify
        //fullPaths: true
    }).transform(
        // We want to convert JSX to normal javascript
        babelify.configure({

            // really only needed for Object.assign
            optional: ["runtime"]

            // can't get this working
            //plugins: ["object-assign"] 
        })
    );

    // We set our dependencies as externals on our app bundler when developing
    (options.development ? dependencies : []).forEach(function (dep) {
        appBundler.external(dep);
    });

    // The rebundle process
    var rebundle = function () {
        var start = Date.now();
        console.log('Building APP bundle');
        appBundler.bundle()
            .on('error', gutil.log)
            .pipe(source('main.js'))
            .pipe(gulpif(!options.development, streamify(uglify())))
            .pipe(gulp.dest(options.dest))
            .pipe(gulpif(options.development, livereload({start: true})))
            .pipe(notify(function () {
                console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
            }));
    };

    // Fire up Watchify when developing
    if (options.development) {
        appBundler = watchify(appBundler);
        appBundler.on('update', rebundle);
    }

    rebundle();

    // We create a separate bundle for our dependencies as they
    // should not rebundle on file changes. This only happens when
    // we develop. When deploying the dependencies will be included
    // in the application bundle
    if (options.development) {

        var testFiles = glob.sync('./specs/**/*-spec.js');
        var testBundler = browserify({
            entries: testFiles,
            debug: true, // Gives us sourcemapping
            cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
        }).transform(
            babelify.configure({
                optional: ["runtime"]
            })
        );

        dependencies.forEach(function (dep) {
            testBundler.external(dep);
        });

        var rebundleTests = function () {
            var start = Date.now();
            console.log('Building TEST bundle');
            testBundler.bundle()
                .on('error', gutil.log)
                .pipe(source('specs.js'))
                .pipe(gulp.dest(options.dest))
                .pipe(livereload({start: true}))
                .pipe(notify(function () {
                    console.log('TEST bundle built in ' + (Date.now() - start) + 'ms');
                }));
        };

        testBundler = watchify(testBundler);
        testBundler.on('update', rebundleTests);
        rebundleTests();

        var vendorsBundler = browserify({
            debug: true,
            require: dependencies
        });

        // Run the vendor bundle
        var start = new Date();
        console.log('Building VENDORS bundle');
        vendorsBundler.bundle()
            .on('error', gutil.log)
            .pipe(source('vendors.js'))
            .pipe(gulpif(!options.development, streamify(uglify())))
            .pipe(gulp.dest(options.dest))
            .pipe(notify(function () {
                console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
            }));

    }

};

var cssTask = function (options) {
    if (options.development) {
        var run = function () {
            var start = new Date();
            console.log('Building CSS bundle');
            gulp.src(options.src)
                .pipe(concat('main.css'))
                .pipe(gulp.dest(options.dest))
                .pipe(notify(function () {
                    console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
                }));
        };
        run();
        gulp.watch(options.src, run);
    } else {
        var start = new Date();

        gulp.src(options.src)
            .pipe(concat('main.css'))
            .pipe(cssmin())
            .pipe(gulp.dest(options.dest))
            .pipe(notify(function () {
                console.log('CSS production bundle built in ' + (Date.now() - start) + 'ms');
            }));
    }
};

// Starts our development workflow
gulp.task('default', function () {

    browserifyTask({
        development: true,
        src: './app/main.js',
        dest: './build'
    });

    cssTask({
        development: true,
        src: ['./styles/**/*.css', './node_modules/bootstrap'],
        dest: './build'
    });

});

gulp.task('deploy', function () {

    browserifyTask({
        development: false,
        src: './app/main.js',
        dest: './dist'
    });

    cssTask({
        development: false,
        src: './styles/**/*.css',
        dest: './dist'
    });

});
