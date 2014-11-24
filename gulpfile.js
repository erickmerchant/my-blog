
var tasks = require('gulp-tasks');
var argv = require('argh').argv;
var build_directory = argv.dev ? "./staging/" : './site/';

tasks.config({
    directory: build_directory,
    js: [
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
    css: [
        "css/site.css"
    ],
    icons: "node_modules/geomicons-open/icons/*.svg",
    images: {
        thumbnails: [608]
    },
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

        site.route('index.html')
            .use(content('posts/*'))
            .use(pager())
            .use(first())
            .render('post.html');

        site.route('posts/{slug}/index.html')
            .use(content('posts/*'))
            .use(pager())
            .render('post.html');

        site.route('posts/index.html')
            .use(content('posts.md'))
            .use(collection('posts', content('posts/*')))
            .render('posts.html');

        site.route('404.html')
            .use(content('404.md'))
            .render('404.html');

        site.after(defaults('./content/defaults.yml'));

        return site.build();
    }
});

tasks();
