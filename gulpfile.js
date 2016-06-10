/**
 * Task Automation to make build and deployment
 * ========================================================================== */

var gulp 		 = require('gulp'),
    browserify 	         = require('browserify'),
    source 		 = require('vinyl-source-stream'),
    gutil 		 = require('gulp-util'),
    babelify		 = require('babelify'),
    browserSync          = require('browser-sync').create(),
    sass 		 = require('gulp-sass'),
    dependencies         = ['react', 'react-dom', 'react-router'];

gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: './',
			index: 'index.html',
		}
	});
    gulp.watch('./index.html').on('change', browserSync.reload);
});

gulp.task('sass', function() {
	gulp.src('./src/scss/*.scss').
		pipe(sass().on('error', gutil.log)).
		pipe(gulp.dest('./dist/css')).
		pipe(browserSync.stream());
});

gulp.task('react-compile', function() {
	var appBundler = browserify({
		entries: './src/app.js',
		debug: true
	});

	dependencies.forEach(function(dep){
  		appBundler.external(dep);
  	});

	appBundler.transform('babelify', {compact: false, presets: ['es2015', 'react']}).
        bundle().on('error',gutil.log).
		pipe(source('main.js')).
		pipe(gulp.dest('./dist/js/')).
		pipe(browserSync.stream());
});

gulp.task('vendors-bundle', function() {
	browserify({
		require: dependencies,
		debug: true
	}).
    bundle().on('error', gutil.log).
    pipe(source('vendors.js')).
    pipe(gulp.dest('./dist/js/'))
});

gulp.task('watch',function() {
	gulp.watch(['./src/scss/*.scss'], ['sass']);
	gulp.watch(['./src/**/*.js'], ['react-compile']);
	gulp.watch(['./src/images/**/*.*'], ['copy-images']);
});

gulp.task('copy-images', function() {
	gulp.src('./static/images/**/*.*').
	pipe(gulp.dest('./dist/images/'));
	browserSync.reload;
});

gulp.task('copy-fonts', function() {
	gulp.src('./static/fonts/**/*.*').
	pipe(gulp.dest('./dist/fonts/'));
	browserSync.reload;
});

gulp.task('copy-smartFox', function() {
	gulp.src('./static/smartFox/SFS2X_API_JS.js').
	pipe(gulp.dest('./dist/js/'));
	browserSync.reload;
});

gulp.task('test', function() {
    browserify({
        entries: './test/tests.js',
	debug: true
    }).transform('babelify', { presets:['es2015','react']}).
    bundle().on('error',gutil.log).
    pipe(source('spec.js')).
    pipe(gulp.dest('./test/dist/'));
});

/**
 * Aliases to run from CLI
 */
 gulp.task('watch-test', function(){
     gulp.watch(['./test/test-file/*.js'],['test']);
 });

 gulp.task('copyes',[
	 'copy-images',
	 'copy-fonts',
	 'copy-smartFox'
 ])

gulp.task('compile', [
	'react-compile',
	'vendors-bundle',
	'copyes',
	'sass'
]);

gulp.task('default', [
	'compile',
	'watch',
	'browser-sync'
]);
