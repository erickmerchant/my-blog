'use strict';

const directory = '../erickmerchant.github.io/';
var gulp = require('gulp');
var main = gulp.series(pages, icons, optimize, css, selectors);

function pages() {

    var nunjucks = require('static-engine-renderer-nunjucks');
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
    var compose = require('static-compose');
    var hljs = require('highlight.js');
    var cson = require('cson-parser');
    var posts;
    var post_pages, archive_page, _404_page;
    var converters;

    nunjucks.configure('./templates/', {
        autoescape: true
    });

    converters = [
        file,
        frontmatter(cson.parse),
        marked({
            highlight: function(code) {

                return hljs.highlightAuto(code).value;
            }
        })
    ];

    posts = compose(content('./content/posts/*', converters), sort.date);

    defaults = defaults('./content/defaults.cson', cson.parse);

    post_pages = [
        posts,
        pager,
        defaults,
        render(directory + 'posts/:slug/index.html', nunjucks('post.html')),
        first,
        render(directory + 'index.html', nunjucks('post.html'))
    ];

    archive_page = [
        content('./content/posts.md', converters),
        collection('posts', posts),
        defaults,
        render(directory + 'posts/index.html', nunjucks('posts.html'))
    ];

    _404_page = [
        content('./content/404.md', converters),
        defaults,
        render(directory + '404.html', nunjucks('404.html'))
    ];

    return engine(post_pages, archive_page, _404_page);
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
    var colors = require('rework-plugin-colors');

    return gulp.src([
            "css/site.css",
            "node_modules/highlight.js/styles/monokai_sublime.css"
        ])
        .pipe(rework(
            npm(),
            vars(),
            media(),
            calc,
            colors()
        ))
        .pipe(autoprefixer('> 1%', 'last 2 versions'))
        .pipe(concat("index.css"))
        .pipe(uncss({
            html: glob.sync(directory + '**/**.html')
        }))
        .pipe(csso())
        .pipe(gulp.dest(directory));
}

function selectors() {

    var gs = require('gulp-selectors');

    return gulp.src([directory + '**/**.html', directory + 'index.css'])
        .pipe(gs.run({ 'css': ['css'], 'html': ['html'] }, { ids: true }))
        .pipe(gulp.dest(directory));
}

function optimize(){

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
            var get_path = function(id) {

                return fs.readFileSync('./node_modules/geomicons-open/src/paths/'+id+'.d', {encoding:'utf8'}).split("\n").join('');
            };

            $('use').each(function(){

                href = $(this).attr('xlink:href');
                id = href.substring(1);

                if($('use[xlink\\:href="'+href+'"]').length > 1) {

                    defs.add(id);
                }
                else {

                    $(this).replaceWith('<path d="' + get_path(id) + '"/>');
                }
            });

            if(defs.size) {

                paths = [];

                for(id of defs) {

                    paths.push('<path d="' + get_path(id) + '" id="' + id + '"/>');
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
    gulp.watch('css/**/*.css', main);
    gulp.watch(['templates/**/*.html', 'content/**/*.md'], main);
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

gulp.task('default', gulp.parallel(base, main, images));

gulp.task('dev', gulp.parallel('default', watch, serve));
