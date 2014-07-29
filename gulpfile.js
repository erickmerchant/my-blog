'use strict';

var gulp = require('gulp');
var chalk = require('chalk');
var gulputil = require('gulp-util');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cheerio = require('gulp-cheerio');
var cleanhtml = require('gulp-cleanhtml');
var footer = require('gulp-footer');
var header = require('gulp-header');
var uncss = require('gulp-uncss');
var glob = require('glob');
var mincss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var imageresize = require('gulp-image-resize');
var tap = require('gulp-tap');
var Q = require('q');

gulp.task('default', ['base', 'scss', 'images', 'js', 'geomicons-sprite', 'geomicons-defs', 'site', 'uncss', 'htmlmin']);

gulp.task('base', function(){

    var stream = gulp.src('base/**').pipe(gulp.dest('site'));

    return stream;
});

gulp.task('scss', function () {

    var stream = gulp.src('assets/scss/site.scss')
        .pipe(sass())
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('images', function () {

    var stream = gulp.src('content/uploads/*.jpg')
        .pipe(gulp.dest('site/uploads'))
        .pipe(imageresize({
            width : 688,
            height : 0
        }))
        .pipe(gulp.dest('site/uploads/thumbnails'));

    return stream;
});

gulp.task('js', function () {

    var stream = gulp.src([
            'assets/js/prism.js',
            'assets/js/turbolinks.min.js',
            'assets/js/geomicons.min.js',
            'assets/js/ender.min.js',
            'assets/js/site.js'
        ])
        .pipe(concat("site.js"))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('geomicons-sprite', function() {

    var stream = gulp.src('assets/geomicons/enabled/*.svg')
        .pipe(concat('geomicons.svg'))
        .pipe(header('<svg xmlns="http://www.w3.org/2000/svg">'))
        .pipe(footer('</svg>'))
        .pipe(cleanhtml())
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('geomicons-defs', function() {

    var stream = gulp.src('assets/geomicons/enabled/*.svg')
        .pipe(cheerio({
            run: function($) {
                var $path = $('svg').children('path'), id = $('svg').attr('id');
                $path.attr('id', id);
                $('svg').replaceWith($path[0]);
            }
        }))
        .pipe(concat('geomicons-defs.svg'))
        .pipe(header('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'))
        .pipe(footer('</defs></svg>'))
        .pipe(cleanhtml())
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('site', function(cb){

    var site = require('./lib/site.js');
    var defaults = require('./lib/middleware/defaults.js');
    var pager = require('./lib/middleware/pager.js');
    var marked_converter = require('./lib/converters/marked.js');
    var nunjucks = require('nunjucks');
    var _ = require('lodash');

    pager = pager();

    site = site({
        nunjucks: nunjucks.configure('./templates/', { autoescape: true }),
        converters: {
            md: marked_converter()
        }
    });

    site.route('home', {

        route: '/',

        template: 'post.html',

        content: 'posts/*',

        middleware: function(pages, next) {

            pager(pages, function(pages){

                next([_.last(pages)]);
            });
        }
    });

    site.route('post', {

        route: '/posts/{slug}/',

        template: 'post.html',

        content: 'posts/*',

        middleware: pager
    });

    site.route('404', { content: '404.md', template: '404.html' });

    site.before(defaults(site, './content/defaults.yml'));

    return site.run();
});

gulp.task('htmlmin', ['site'], function () {

    var stream = gulp.src('site/**/**.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('site'));

    return stream;
});

gulp.task('uncss', ['htmlmin', 'scss'], function (cb) {

    var ignore = [
        /\.token.*/,
        /\.style.*/,
        /\.namespace.*/
    ];

    glob('site/**/**.html', function(err, files){

        gulp.src('site/assets/site.css')
            .pipe(uncss({html: files, ignore: ignore}))
            .pipe(mincss())
            .pipe(gulp.dest('site/assets'))
            .pipe(tap(function(){ cb(); }))
        ;
    });

});

// if(gulputil.env.watch) {
//
//     default_task_deps.push('watch');
// }
//
// gulp.task('watch', function () {
//
//     gulp.watch('assets/scss/**', ['scss']);
//     gulp.watch('assets/geomicons/*.svg', ['geomicons-sprite', 'geomicons-defs']);
//     gulp.watch('assets/js/**', ['js']);
// });
