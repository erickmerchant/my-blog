'use strict';

var gulp = require('gulp');
var argh = require('argh');
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
var slug = require('slug');
var fs = require('fs');
var trimmer = require('trimmer');
var mkdirp = require('mkdirp');
var path = require('path');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-X"];

var default_task_deps = ['base', 'scss', 'images', 'js', 'geomicons', 'site'];

if (!argh.argv.dev) {

    default_task_deps.push('uncss', 'htmlmin');
}

gulp.task('default', default_task_deps);

gulp.task('base', function() {

    var stream = gulp.src('base/**').pipe(gulp.dest('site'));

    return stream;
});

gulp.task('scss', function() {

    var outputStyle = argh.argv.dev ? 'nested' : 'compressed';

    var stream = gulp.src('assets/scss/site.scss')
        .pipe(sass({
            outputStyle: outputStyle
        }))
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(gulp.dest('site/assets'));

    return stream;
});

gulp.task('images', function() {

    var stream = gulp.src('content/uploads/*.jpg')
        .pipe(changed('site/uploads'))
        .pipe(gulp.dest('site/uploads'))
        .pipe(imageresize({
            width: 688,
            height: 0,
            imageMagick: true
        }))
        .pipe(gulp.dest('site/uploads/thumbnails'));

    return stream;
});

gulp.task('js', function() {

    var stream = gulp.src([
        'assets/js/prism.js',
        'assets/js/turbolinks.min.js',
        'assets/js/geomicons.min.js',
        'assets/js/ender.min.js',
        'assets/js/site.js'
    ])
        .pipe(concat("site.js"));

    if (!argh.argv.dev) {

        stream.pipe(uglify({
            preserveComments: 'some'
        }))
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

gulp.task('site', function(cb) {

    var site = require('./lib/site.js');
    var defaults = require('./lib/plugins/defaults.js');
    var content = require('./lib/plugins/content.js');
    var pager = require('./lib/plugins/pager.js');
    var marked_converter = require('./lib/converters/marked.js');
    var nunjucks = require('nunjucks');
    var _ = require('lodash');

    pager = pager();

    content.configure('./content/', {
        converters: {
            md: marked_converter()
        },
        date_formats: date_formats
    });

    nunjucks.configure('./templates/', {
        autoescape: true
    })

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

            posts([], function(posts) {

                _.map(posts, function(v, k) {

                    var page = v.page;

                    page.year_month = page.date.format(
                        'MMMM YYYY');

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

gulp.task('htmlmin', ['site'], function() {

    var stream = gulp.src('site/**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('site'));

    return stream;
});

gulp.task('uncss', ['htmlmin', 'scss'], function(cb) {

    var ignore = [
        /\.token.*/,
        /\.style.*/,
        /\.namespace.*/
    ];

    glob('site/**/**.html', function(err, files) {

        gulp.src('site/assets/site.css')
            .pipe(uncss({
                html: files,
                ignore: ignore
            }))
            .pipe(minifycss())
            .pipe(gulp.dest('site/assets'))
            .pipe(tap(function() {
                cb();
            }));
    });

});

gulp.task('watch', ['default'], function() {

    gulp.watch('base/**', ['base']);
    gulp.watch('content/uploads/*.jpg', ['images']);
    gulp.watch('assets/js/**.js', ['js']);
    gulp.watch('assets/geomicons/**/**.svg', ['geomicons']);

    if (!argh.argv.dev) {

        gulp.watch('assets/scss/**.scss', ['scss', 'uncss']);
        gulp.watch('templates/**/**.html', ['site', 'htmlmin', 'uncss']);
        gulp.watch('content/**', ['site', 'htmlmin', 'uncss']);

    } else {

        gulp.watch('assets/scss/**.scss', ['scss']);
        gulp.watch('templates/**/**.html', ['site']);
        gulp.watch('content/**', ['site']);
    }
});

gulp.task('serve', function() {

    var server = new node_static.Server('./site/');

    require('http').createServer(function(request, response) {
        request.addListener('end', function() {
            server.serve(request, response, function(err, result) {

                var color;
                var status;
                var end = true;

                if (err) {

                    if (err.status === 404 && fs.existsSync(
                        './site/404.html')) {

                        end = false;

                        server.serveFile('404.html', 404, {},
                            request, response);

                    } else {
                        response.writeHead(err.status, err.headers);
                    }

                    color = err.status < 500 ? chalk.yellow :
                        chalk.red;
                    status = err.status;
                } else {

                    color = chalk.green;
                    status = response.statusCode;
                }

                console.log('[' + chalk.gray(moment().format(
                        'HH:mm:ss')) + '] [' + color(status) +
                    '] ' + color(request.url));

                if (end) {

                    response.end();
                }
            });

        }).resume();

    }).listen(8080);
});

gulp.task('make', function(cb) {

    var file;
    var format;
    var ext = 'md';
    var content;

    if (!argh.argv.title) {

        console.error(chalk.red('You must provide a title.'));

        cb();

        return;
    }

    file = slug(argh.argv.title).toLowerCase();

    if (argh.argv.date) {

        format = argh.argv.date;

        if (format === true) {

            format = "YYYY-MM-DD";
        }

        file = moment().format(format) + '.' + file;
    }

    if (argh.argv.ext) {

        ext = argh.argv.ext;
    }

    file = file + '.' + ext;

    if (argh.argv. in ) {

        file = trimmer(argh.argv. in , '/') + '/' + file;
    }

    content = "---\ntitle: \"" + argh.argv.title + "\"\n---";

    var directory = path.dirname(file);

    mkdirp(directory, function(err) {

        if (err) throw err;

        fs.writeFile(file, content, function(err) {

            if (err) throw err;

            console.log(chalk.green(file + ' saved.'));

            cb();
        });
    });
});

gulp.task('move', function(cb) {

    var file;

    var newFile = '';

    var ext;

    var parts;

    var slug;

    var date;

    var format

    if (!argh.argv.file || !argh.argv.to) {

        console.error(chalk.red(
            'You must provide a file to move and where to move it to.'));

        cb();

        return;
    }

    file = trimmer(argh.argv.file, '/');

    ext = path.extname(file);

    parts = path.basename(file, ext).split('.');

    slug = path.basename(file, ext);

    if (parts.length >= 2) {

        if (moment(parts[0], date_formats).isValid()) {

            date = parts[0];

            slug = parts.slice(1).join('.');
        }
    }

    if (argh.argv.date) {

        format = argh.argv.date;

        if (format === true) {

            format = "YYYY-MM-DD";
        }

        if (!date) {

            date = moment().format(format);
        } else {

            date = moment(date).format(format);
        }
    }

    if (argh.argv.date === false && date) {

        date = false;
    }

    if (date) {

        newFile = date + '.';
    }

    if (argh.argv.title) {

        slug = slug(argh.argv.title).toLowerCase();
    }

    newFile = newFile + slug + ext;

    newFile = trimmer(argh.argv.to, '/') + '/' + newFile;

    var directory = path.dirname(newFile);

    mkdirp(directory, function(err) {

        if (err) throw err;

        fs.rename(file, newFile, function(err) {

            if (err) throw err;

            console.log(chalk.green(file + ' moved to ' + newFile +
                '.'));

            cb();
        });
    });
});
