
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
var serve = require('server');

function build() {

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
    var compose = require('static-engine/compose');
    var hljs = require('highlight.js');
    var posts;
    var defaults;
    var formula = [];

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

    posts = compose([content('posts/*'), sort.date]);

    defaults = defaults('./content/defaults.yml');

    formula.push([
        posts,
        pager,
        defaults,
        render('posts/{slug}/index.html', nunjucks('post.html')),
        first,
        render('index.html', nunjucks('post.html'))
    ]);

    formula.push([
        content('posts.md'),
        collection('posts', [posts]),
        defaults,
        render('posts/index.html', nunjucks('posts.html'))
    ]);

    formula.push([
        content('404.md'),
        defaults,
        render('404.html', nunjucks('404.html'))
    ]);

    return engine(formula);
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

function html(){

    var htmlmin = require('gulp-htmlmin');
    var cheerio = require('gulp-cheerio');

    return gulp.src(config.directory + '**/**.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(cheerio(function ($) {

            var uses = [];

            $('use').each(function(){

                uses.push($(this).attr('xlink:href'));
            });

            $('path[id]').each(function(){

                if(uses.indexOf('#'+$(this).attr('id')) < 0) {

                    $(this).replaceWith('');
                }
            })
        }))
        .pipe(gulp.dest(config.directory));
}

function icons() {

    var cheerio = require('gulp-cheerio');
    var concat = require('gulp-concat');
    var footer = require('gulp-footer');
    var header = require('gulp-header');

    return gulp.src(config.icons)
        .pipe(cheerio(function ($) {
            var $path = $('svg').children('path');
            var id = $('svg').attr('id');
            $path.attr('id', id);
            $('svg').replaceWith($path[0]);
        }))
        .pipe(concat('icons.svg'))
        .pipe(header(
            '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'
        ))
        .pipe(footer('</defs></svg>'))
        .pipe(gulp.dest('templates/temp'));
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

gulp.task('default', gulp.parallel(base, gulp.series(icons, build, html, css), images));

gulp.task('watch', function() {

    gulp.watch('base/**', base);
    gulp.watch('content/uploads/**/**.jpg', images);
    gulp.watch('css/**/**.css', css);
    gulp.watch(['templates/**/**.html', 'content/**'], gulp.series(build, html, css));
});

gulp.task('serve', gulp.parallel('default', 'watch', serve(config.directory)));
