'use strict';

const directory = '../erickmerchant.github.io/';
var gulp = require('gulp');
var htmlCSSSeries = gulp.series(pages, icons, minifyHTML, css, shortenSelectors, insertCSS);
var allParallel = gulp.parallel(base, htmlCSSSeries, images);
var optimize = false;

gulp.task('default', gulp.series(optimizeOn, allParallel, gitStatus));

gulp.task('dev', gulp.parallel(allParallel, watch, serve));

gulp.task('preview', serve);

function optimizeOn(done) {

    optimize = true;

    done();
}

function gitStatus(cb) {

    var git = require('gulp-git');

    git.status({args: '--porcelain', cwd: directory, quiet: true}, function (err, out) {

        if (err) {

            throw err;
        }

        if(out) {

            console.log(out.trimRight());
        }

        cb();
    });
}

function pages() {

    var swig = require('swig');
    var moment = require('moment');
    var engine = require('static-engine');
    var content = require('static-engine-content');
    var defaults = require('static-engine-defaults');
    var pager = require('static-engine-pager');
    var first = require('static-engine-first');
    var collection = require('static-engine-collection');
    var marked = require('static-engine-converter-marked');
    var file = require('static-engine-converter-file');
    var frontmatter = require('static-engine-converter-frontmatter');
    var render = require('static-engine-render');
    var sort = require('static-engine-sort');
    var hljs = require('highlight.js');
    var cson = require('cson-parser');
    var postPages, archivePage, _404Page, renderer;

    swig.setDefaults({ cache: false });

    renderer = function(file) {

        return function(page, done) {

            swig.renderFile('./templates/' + file, page, done);
        };
    };

    frontmatter = frontmatter(cson.parse);

    marked = marked({
        highlight: function(code) {

            return hljs.highlightAuto(code).value;
        }
    });

    file = file('./content/:categories+/:date.:slug.md', {
        date: function(date) {

            return moment(date, 'x');
        }
    });

    sort = sort(function(a, b) {

        return b.date.diff(a.date);
    });

    defaults = defaults('./content/defaults.cson', cson.parse);

    postPages = [
        content('./content/posts/*'),
        file,
        frontmatter,
        marked,
        sort,
        pager,
        defaults,
        render(directory + 'posts/:slug/index.html', renderer('post.html')),
        first,
        render(directory + 'index.html', renderer('post.html'))
    ];

    archivePage = [
        content('./content/posts.md'),
        frontmatter,
        marked,
        collection('posts', [
            content('./content/posts/*'),
            file,
            frontmatter,
            marked,
            sort
        ]),
        defaults,
        render(directory + 'posts/index.html', renderer('posts.html'))
    ];

    _404Page = [
        content('./content/404.md'),
        frontmatter,
        marked,
        defaults,
        render(directory + '404.html', renderer('404.html'))
    ];

    return engine(postPages, archivePage, _404Page);
}

function base(){

    return gulp.src('base/**').pipe(gulp.dest(directory));
}

function css(){

    var autoprefixer = require('gulp-autoprefixer');
    var uncss = require('gulp-uncss');
    var csso = require('gulp-csso');
    var glob = require('glob');
    var rework = require('gulp-rework');
    var concat = require('gulp-concat');
    var calc = require('rework-calc');
    var media = require('rework-custom-media');
    var npm = require('rework-npm');
    var vars = require('rework-vars');
    var color = require('rework-color-function');
    var gulpif = require('gulp-if');

    return gulp.src([
            "css/site.css",
            "node_modules/highlight.js/styles/monokai_sublime.css"
        ])
        .pipe(rework(
            npm(),
            vars(),
            media(),
            calc,
            color
        ))
        .pipe(autoprefixer({ browsers: ['> 5%', 'last 2 versions'] }))
        .pipe(concat("index.css"))
        .pipe(gulpif(optimize, uncss({
            html: glob.sync(directory + '**/**.html')
        })))
        .pipe(csso())
        .pipe(gulp.dest(directory));
}

function shortenSelectors() {

    var selectors = require('gulp-selectors');
    var gulpif = require('gulp-if');

    return gulp.src([directory + '**/**.html', directory + 'index.css'])
        .pipe(gulpif(optimize, selectors.run({ 'css': ['css'], 'html': ['html'] }, { ids: true })))
        .pipe(gulp.dest(directory));
}

function insertCSS(done) {

    var path = require('path');
    var tap = require('gulp-tap');
    var csso = require('gulp-csso');
    var cheerio = require('gulp-cheerio');
    var glob = require('glob');
    var htmls = glob.sync(directory + '**/**.html');
    var uncss = require('gulp-uncss');
    var end = require('stream-end');
    var gulpif = require('gulp-if');
    var inline = function(html, next) {

        return gulp.src(directory + 'index.css')
            .pipe(gulpif(optimize, uncss({
                html: [html]
            })))
            .pipe(csso())
            .pipe(tap(function(file){

                gulp.src([html])
                    .pipe(cheerio(function($){

                        $('[rel="stylesheet"][href="/index.css"]').replaceWith('<style type="text/css">'+file.contents.toString()+'</style>');

                    }))
                    .pipe(gulp.dest(path.dirname(html)))
                    .pipe(end(next));
            }));
    };
    var next = function(){

        if(htmls.length) {

            inline(htmls.shift(), next);
        }
        else {

            done();
        }
    };

    if(optimize) {

        inline(htmls.shift(), next);
    }
    else {

        done();
    }
}

function minifyHTML(){

    var htmlmin = require('gulp-htmlmin');

    return gulp.src(directory + '**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(directory));
}

function icons() {

    var cheerio = require('gulp-cheerio');
    var fs = require('fs');

    return gulp.src(directory + '**/**.html')
        .pipe(cheerio(function($){

            var defs = new Set();
            var href;
            var id;
            var paths;
            var getPath = function(id) {

                return fs.readFileSync('./node_modules/geomicons-open/src/paths/'+id+'.d', {encoding:'utf8'}).split("\n").join('');
            };

            $('use').each(function(){

                href = $(this).attr('xlink:href');
                id = href.substring(1);

                if($('use[xlink\\:href="'+href+'"]').length > 1) {

                    defs.add(id);
                }
                else {

                    $(this).replaceWith('<path d="' + getPath(id) + '"/>');
                }
            });

            if(defs.size) {

                paths = [];

                for(id of defs) {

                    paths.push('<path d="' + getPath(id) + '" id="' + id + '"/>');
                }

                $('body').append('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'+paths.join('')+'</defs></svg>')
            }
        }))
        .pipe(gulp.dest(directory));
}

function images() {

    var imageresize = require('gulp-image-resize');
    var changed = require('gulp-changed');
    var imagemin = require('gulp-imagemin');
    var merge = require('merge-stream');
    var image;
    var merged;

    var stream = gulp.src('content/uploads/*.jpg')
        .pipe(changed(directory + 'uploads'))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(directory + 'uploads'));

    merged = merge(stream);

    stream = gulp.src('content/uploads/*.jpg')
        .pipe(changed(directory + 'uploads'))
        .pipe(imageresize({
            width: 622,
            height: 0,
            imageMagick: true
        }))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(directory + 'uploads/thumbnails/'));

        merged.add(stream);

    return merged;
}

function watch() {

    gulp.watch('base/**/*', base);
    gulp.watch('content/uploads/**/*.jpg', images);
    gulp.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], htmlCSSSeries);
}

function serve(done){

    var express = require('express');
    var _static = require('express-static');
    var logger = require('express-log');
    var fs = require('fs');
    var path = require('path');

    var app = express();

    app.use(logger());

    app.use(_static(directory));

    app.use(function(req, res, next){
        res.status(404);

        if (req.accepts('html') && fs.existsSync(directory + '404.html')) {
            res.sendFile(path.resolve(directory, '404.html'));

            return;
        }

        res.type('txt').send('Not found');
    });

    var server = app.listen(8088, function(){
        console.log('server is running at %s', server.address().port);
    });

    done();
}
