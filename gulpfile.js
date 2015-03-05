
var gulp = require('gulp');
var config = {
    directory: './site/',
    css: [
        "css/site.css",
        "node_modules/highlight.js/styles/monokai_sublime.css"
    ],
    icons: "node_modules/geomicons-open/icons/*.svg",
    images: {
        thumbnails: [622]
    }
};

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
        render(config.directory + 'posts/:slug/index.html', nunjucks('post.html')),
        first,
        render(config.directory + 'index.html', nunjucks('post.html'))
    ];

    archive_page = [
        content('./content/posts.md', converters),
        collection('posts', posts),
        defaults,
        render(config.directory + 'posts/index.html', nunjucks('posts.html'))
    ];

    _404_page = [
        content('./content/404.md', converters),
        defaults,
        render(config.directory + '404.html', nunjucks('404.html'))
    ];

    return engine(post_pages, archive_page, _404_page);
}

function base(){

    return gulp.src('base/**').pipe(gulp.dest(config.directory));
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

    var stream = gulp.src(config.css)
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
            html: glob.sync(config.directory + '**/**.html')
        }))
        .pipe(csso());

    return stream.pipe(gulp.dest(config.directory));
}

function combine(done) {

    var path = require('path');
    var tap = require('gulp-tap');
    var csso = require('gulp-csso');
    var cheerio = require('gulp-cheerio');
    var glob = require('glob');
    var htmls = glob.sync(config.directory + '**/**.html');
    var uncss = require('gulp-uncss');
    var end = require('stream-end');
    var inline = function(html, next) {

        return gulp.src(config.directory + 'index.css')
            .pipe(uncss({
                html: [html]
            }))
            .pipe(csso())
            .pipe(tap(function(file){

                gulp.src([html])
                    .pipe(cheerio(function($){

                        $('head').append('<style type="text/css">'+file.contents.toString()+'</style>');

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

    inline(htmls.shift(), next);
}

function selectors() {

    var gs = require('gulp-selectors');

    return gulp.src([config.directory + '**/**.html', config.directory + 'index.css'])
        .pipe(gs.run({ 'css': ['css'], 'html': ['html'] }, { ids: true }))
        .pipe(gulp.dest(config.directory));
}

function optimize(){

    var htmlmin = require('gulp-htmlmin');

    return gulp.src(config.directory + '**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(config.directory));
}

function icons() {

    var cheerio = require('gulp-cheerio');
    var concat = require('gulp-concat');
    var tap = require('gulp-tap');
    var clean = require('gulp-htmlclean');

    return gulp.src(config.icons)
    .pipe(cheerio(function ($) {
        var $path = $('svg').children('path');
        var id = $('svg').attr('id');
        $path.attr('id', id);
        $('svg').replaceWith($path[0]);
    }))
    .pipe(concat('icons.svg'))
    .pipe(tap(function(file){

        return gulp.src(config.directory + '**/**.html')
        .pipe(cheerio(function($){

            var defs = $('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'+file.contents+'</defs></svg>');
            var uses = [];

            $('body').append(defs);

            $('use').each(function(){

                uses.push($(this).attr('xlink:href'));
            });

            $('use').each(function(){

                var el = $(this);
                var href = el.attr('xlink:href');
                var index = uses.indexOf(href);

                if(index == uses.lastIndexOf(href)) {

                    el.replaceWith($.html('path'+href));

                    uses.splice(index, 1);
                }
            });

            $('defs path[id]').each(function(){

                var el = $(this);

                if(uses.indexOf('#'+el.attr('id')) < 0) {

                    el.replaceWith('');
                }
            });

            $('defs').filter(function(){

                return !$(this).find('path').length;

            }).parent().remove();
        }))
        .pipe(clean())
        .pipe(gulp.dest(config.directory));
    }));
}

function images() {

    var imageresize = require('gulp-image-resize');
    var changed = require('gulp-changed');
    var imagemin = require('gulp-imagemin');
    var merge = require('merge-stream');
    var image;
    var directory;
    var merged;

    var stream = gulp.src('content/uploads/*.jpg')
        .pipe(changed(config.directory + 'uploads'))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(config.directory + 'uploads'));

    merged = merge(stream);

    for(directory in config.images) {

        image = config.images[directory];

        if(!image[0] && !image[1]) return;

        stream = gulp.src('content/uploads/*.jpg')
            .pipe(changed(config.directory + 'uploads'))
            .pipe(imageresize({
                width: image[0] || 0,
                height: image[1] || 0,
                imageMagick: true
            }))
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(config.directory + 'uploads/' + directory));

        merged.add(stream);
    }

    return merged;
}

function watch() {

    gulp.watch('base/**/*', base);
    gulp.watch('content/uploads/**/*.jpg', images);
    gulp.watch('css/**/*.css', gulp.series(pages, optimize, icons, css, selectors, combine));
    gulp.watch(['templates/**/*.html', 'content/**/*.md'], gulp.series(pages, optimize, icons, css, selectors, combine));
}

function serve(done){

    var express = require('express');
    var static = require('express-static');
    var logger = require('express-log');
    var fs = require('fs');
    var path = require('path');

    var app = express();

    app.use(logger());

    app.use(static(config.directory));

    app.use(function(req, res, next){
        res.status(404);

        if (req.accepts('html') && fs.existsSync(config.directory + '404.html')) {
            res.sendFile(path.resolve(config.directory, '404.html'));

            return;
        }

        res.type('txt').send('Not found');
    });

    var server = app.listen(8088, function(){
        console.log('server is running at %s', server.address().port);
    });

    done();
}

gulp.task('default', gulp.parallel(base, gulp.series(pages, optimize, icons, css, selectors, combine), images));

gulp.task('dev', gulp.parallel('default', watch, serve));
