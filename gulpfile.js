
var tasks = require('gulp-tasks');
var argv = require('argh').argv;
var build_directory = argv.dev ? "./staging/" : './site/';
var Promise = require('es6-promise').Promise;

tasks.config({
    directory: build_directory,
    js: [
        "node_modules/fastclick/lib/fastclick.js",
        "js/site.js"
    ],
    css: [
        "css/site.css",
        "node_modules/highlight.js/styles/monokai_sublime.css"
    ],
    icons: "node_modules/geomicons-open/icons/*.svg",
    images: {
        thumbnails: [608]
    },
    build: function() {

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

        render.configure(build_directory);

        content.configure('./content/', [
            file,
            frontmatter,
            marked({
                highlight: function(code) {
                    return require('highlight.js').highlightAuto(code).value;
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
});

tasks();
