'use strict';

var gulp = require('gulp');
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
var changed = require('gulp-changed');
var Q = require('q');

var default_task_deps = ['base', 'scss', 'images', 'js', 'geomicons', 'site'];

if(!gulputil.env.dev) {

    default_task_deps.push('uncss', 'htmlmin');
}

if(gulputil.env.watch) {

    default_task_deps.push('watch');
}

gulp.task('default', default_task_deps);

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
        .pipe(changed('site/uploads'))
        .pipe(gulp.dest('site/uploads'))
        .pipe(imageresize({
            width : 688,
            height : 0,
            imageMagick: true
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
        .pipe(concat("site.js"));

    if(!gulputil.env.dev) {

        stream.pipe(uglify({preserveComments: 'some'}))
    }

    stream.pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('geomicons', ['geomicons-sprite', 'geomicons-defs']);

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
    var defaults = require('./lib/plugins/defaults.js');
    var content = require('./lib/plugins/content.js');
    var pager = require('./lib/plugins/pager.js');
    var marked_converter = require('./lib/converters/marked.js');
    var nunjucks = require('nunjucks');
    var _ = require('lodash');

    pager = pager();

    content.configure('./content/', {
        converters: { md: marked_converter() },
        date_formats: [ "YYYY-MM-DD" ]
    });

    site = site('./site/', nunjucks.configure('./templates/', { autoescape: true }));

    site.route('/')
        .alias('home')
        .use(content('posts/*'))
        .use(pager)
        .use(function(pages, next) {

            next([_.last(pages)]);
        })
        .render('post.html');

    site.route('/posts/{slug}/')
        .alias('post')
        .use(content('posts/*'))
        .use(pager)
        .render('post.html');

    site.route('404').use(content('404.md')).render('404.html');

    site.after(defaults(site, './content/defaults.yml'));

    return site.build();
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

gulp.task('watch', function () {

    gulp.watch('base/**', ['base']);
    gulp.watch('content/uploads/*.jpg', ['images']);
    gulp.watch('assets/js/**.js', ['js']);
    gulp.watch('assets/geomicons/**/**.svg', ['geomicons']);

    if(!gulputil.env.dev) {

        gulp.watch('assets/scss/**.scss', ['scss', 'uncss']);
        gulp.watch('templates/**/**.html', ['site', 'htmlmin', 'uncss']);
        gulp.watch('content/**', ['site', 'htmlmin', 'uncss']);

    }
    else {

        gulp.watch('assets/scss/**.scss', ['scss']);
        gulp.watch('templates/**/**.html', ['site']);
        gulp.watch('content/**', ['site']);
    }
});
