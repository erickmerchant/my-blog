
var tasks = require('gulp-tasks');
var build_directory = "./site/";

tasks.config({
    build_directory: build_directory,
    js_files: [
        "node_modules/fastclick/lib/fastclick.js",
        "node_modules/prismjs/components/prism-core.js",
        "node_modules/prismjs/components/prism-markup.js",
        "node_modules/prismjs/components/prism-twig.js",
        "node_modules/prismjs/components/prism-css.js",
        "node_modules/prismjs/components/prism-clike.js",
        "node_modules/prismjs/components/prism-javascript.js",
        "node_modules/prismjs/components/prism-php.js",
        "node_modules/prismjs/components/prism-scss.js",
        "js/prism-apacheconf.js",
        "js/site.js"
    ],
    css_files: [
        "css/site.css"
    ],
    icon_files: [
        "node_modules/geomicons-open/icons/calendar.svg",
        "node_modules/geomicons-open/icons/chevron-left.svg",
        "node_modules/geomicons-open/icons/chevron-right.svg",
        "node_modules/geomicons-open/icons/github.svg",
        "node_modules/geomicons-open/icons/home.svg",
        "node_modules/geomicons-open/icons/search.svg",
        "node_modules/geomicons-open/icons/twitter.svg"
    ],
    thumbnails: [
        {
            width: 608
        }
    ],
    build: function() {

        var nunjucks = require('nunjucks');
        var engine = require('static-engine');
        var content = require('static-engine-content');
        var defaults = require('static-engine-defaults');
        var pager = require('static-engine-pager');
        var first = require('static-engine-first');
        var collection = require('static-engine-collection');
        var marked = require('static-engine-converter-marked');
        var file = require('static-engine-converter-file');
        var frontmatter = require('static-engine-converter-frontmatter');
        var site = engine(build_directory, nunjucks.render);

        content.configure('./content/', [
            file(),
            frontmatter(),
            marked()
        ]);

        nunjucks.configure('./templates/', {
            autoescape: true
        });

        site.route('/')
            .use(content('posts/*'))
            .use(pager())
            .use(first())
            .render('post.html');

        site.route('/posts/{slug}/')
            .use(content('posts/*'))
            .use(pager())
            .render('post.html');

        site.route('/posts/')
            .use(content('posts.md'))
            .use(collection('posts', content('posts/*')))
            .render('posts.html');

        site.route('/404.html')
            .use(content('404.md'))
            .render('404.html');

        site.after(defaults('./content/defaults.yml'));

        return site.build();
    }
});

tasks();
