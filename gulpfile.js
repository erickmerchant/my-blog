
var gulp = require('gulp');
var config = {
    directory: './site/',
    css: [
        "css/site.css",
        "node_modules/highlight.js/styles/monokai_sublime.css"
    ],
    icons: "node_modules/geomicons-open/icons/*.svg",
    images: {
        thumbnails: [626]
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
    var posts;
    var post_pages, archive_page, _404_page;

    nunjucks.configure('./templates/', {
        autoescape: true
    });

    render.configure('./site/');

    content.configure('./content/', [
        file,
        frontmatter,
        marked({
            highlight: function(code) {

                return hljs.highlightAuto(code).value;
            }
        })
    ]);

    posts = compose(content('posts/*'), sort.date);

    defaults = defaults('./content/defaults.yml');

    post_pages = [
        posts,
        pager,
        defaults,
        render('posts/{slug}/index.html', nunjucks('post.html')),
        first,
        render('index.html', nunjucks('post.html'))
    ];

    archive_page = [
        content('posts.md'),
        collection('posts', posts),
        defaults,
        render('posts/index.html', nunjucks('posts.html'))
    ];

    _404_page = [
        content('404.md'),
        defaults,
        render('404.html', nunjucks('404.html'))
    ];

    return engine(post_pages, archive_page, _404_page);
}

function base(){

    return gulp.src('base/**').pipe(gulp.dest(config.directory));
}

function css(){

    var autoprefixer = require('gulp-autoprefixer');
    var uncss = require('gulp-uncss');
    var minifycss = require('gulp-minify-css');
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
        .pipe(minifycss());

    return stream.pipe(gulp.dest(config.directory));
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

            $('path[id]').each(function(){

                if(uses.indexOf('#'+$(this).attr('id')) < 0) {

                    $(this).replaceWith('');
                }
            });
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

    gulp.watch('base/**', base);
    gulp.watch('content/uploads/**/**.jpg', images);
    gulp.watch('css/**/**.css', css);
    gulp.watch(['templates/**/**.html', 'content/**'], gulp.series(pages, optimize, icons, css));
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

    var server = app.listen(8080, function(){
        console.log('server is running at %s', server.address().port);
    });

    done();
}

gulp.task('default', gulp.parallel(base, gulp.series(pages, optimize, icons, css), images));

gulp.task('dev', gulp.parallel('default', watch, serve));
