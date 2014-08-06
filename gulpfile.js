'use strict';

var gulp = require('gulp');
var yargs = require('yargs');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cheerio = require('gulp-cheerio');
var cleanhtml = require('gulp-cleanhtml');
var footer = require('gulp-footer');
var header = require('gulp-header');
var uncss = require('gulp-uncss');
var glob = require('glob');
var minifycss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var imageresize = require('gulp-image-resize');
var tap = require('gulp-tap');
var changed = require('gulp-changed');
var Q = require('q');
var node_static = require('node-static');
var chalk = require('chalk');
var moment = require('moment');

var default_task_deps = ['base', 'scss', 'images', 'js', 'geomicons', 'site'];

if(!yargs.argv.dev) {

    default_task_deps.push('uncss', 'htmlmin');
}

gulp.task('default', default_task_deps);

gulp.task('base', function(){

    var stream = gulp.src('base/**').pipe(gulp.dest('site'));

    return stream;
});

gulp.task('scss', function () {

    var outputStyle = yargs.argv.dev ? 'nested' : 'compressed';

    var stream = gulp.src('assets/scss/site.scss')
        .pipe(sass({outputStyle: outputStyle}))
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

    if(!yargs.argv.dev) {

        stream.pipe(uglify({preserveComments: 'some'}))
    }

    stream.pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('geomicons', function() {

    var stream = gulp.src('assets/geomicons/enabled/*.svg')
        .pipe(concat('geomicons.svg'))
        .pipe(header('<svg xmlns="http://www.w3.org/2000/svg">'))
        .pipe(footer('</svg>'))
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

    nunjucks.configure('./templates/', { autoescape: true })

    site = site('./site/');

    site.engine(nunjucks.render);

    site.route('/')
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

    site.route('/posts/')
        .use(content('posts.md'))
        .use(function(pages, next) {

            var posts = content('posts/*');

            posts([], function(posts){

                _.map(posts, function(v, k){

                    var page = v.page;

                    page.year_month = page.date.format('MMMM YYYY');

                    posts[k] = page;
                });

                pages[0].page.posts = posts.reverse();

                next(pages);
            });
        })
        .render('posts.html');

    site.route('/drafts/{slug}/')
        .alias('draft')
        .use(content('drafts/*'))
        .use(pager)
        .render('draft.html');

    site.route('/drafts/')
        .use(content('drafts/*'))
        .use(pager)
        .use(function(pages, next) {

            next([_.last(pages)]);
        })
        .render('draft.html');

    site.route('/404.html').use(content('404.md')).render('404.html');

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
            .pipe(minifycss())
            .pipe(gulp.dest('site/assets'))
            .pipe(tap(function(){ cb(); }))
        ;
    });

});

gulp.task('watch', ['default'], function () {

    gulp.watch('base/**', ['base']);
    gulp.watch('content/uploads/*.jpg', ['images']);
    gulp.watch('assets/js/**.js', ['js']);
    gulp.watch('assets/geomicons/**/**.svg', ['geomicons']);

    if(!yargs.argv.dev) {

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

gulp.task('serve', ['default'], function () {

    var server = new node_static.Server('./site/');

    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response, function (err, result) {

                var message;
                var end = true

                if (err) {

                    if(err.status === 404) {

                        end = false;

                        server.serveFile('404.html', 404, {}, request, response);
                    }
                    else {
                        response.writeHead(err.status, err.headers);
                    }

                    message = '[' + chalk.red(err.status) + ']';
                }
                else {

                    message = '[' + chalk.green(response.statusCode) + ']';
                }

                console.log('[' + chalk.gray(moment().format('HH:mm:ss')) + '] ' + message + ' serving ' + request.url);

                if(end) {

                    response.end();
                }
            });
        }).resume();

    }).listen(8080);
});
