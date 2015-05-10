'use strict'

const directory = '../erickmerchant.github.io/'
const path = require('path')
const gulp = require('gulp')
const allParallel = gulp.parallel(base, gulp.series(gulp.parallel(gulp.series(pages, icons, minifyHTML), css), insertCSS), images)

gulp.task('default', gulp.series(allParallel, gitStatus))

gulp.task('dev', gulp.parallel(allParallel, watch, serve))

function gitStatus (cb) {
  const git = require('gulp-git')

  git.status({args: '--porcelain', cwd: directory, quiet: true}, function (err, out) {
    if (err) {
      throw err
    }

    if (out) {
      console.log(out.trimRight())
    }

    cb()
  })
}

function pages () {
  const swig = require('swig')
  const moment = require('moment')
  const engine = require('static-engine')
  const read = require('static-engine-read')
  const pager = require('static-engine-pager')
  const first = require('static-engine-first')
  const collection = require('static-engine-collection')
  const render = require('static-engine-render')
  const hljs = require('highlight.js')
  const cson = require('cson-parser')
  const Remarkable = require('remarkable')
  var defaults = require('static-engine-defaults')
  var params = require('static-engine-params')
  var frontmatter = require('static-engine-frontmatter')
  var sort = require('static-engine-sort')
  var postPages, archivePage, _404Page
  var markdown, remarkable

  function renderer (file) {
    return function (page, done) {
      swig.renderFile(path.join('./templates/', file), page, done)
    }
  }

  swig.setDefaults({ cache: false })

  frontmatter = frontmatter(cson.parse)

  remarkable = new Remarkable({
    highlight: function (code) {
      return hljs.highlightAuto(code).value
    },
    langPrefix: 'lang-'
  })

  markdown = function (pages, done) {
    pages.forEach(function (page) {
      page.content = remarkable.render(page.content)

      return page
    })

    done(null, pages)
  }

  params = params('./content/:categories+/:date.:slug.md', {
    date: function (date) {
      return moment(date, 'x')
    }
  })

  sort = sort(function (a, b) {
    return b.date.diff(a.date)
  })

  defaults = defaults('./content/defaults.cson', cson.parse)

  postPages = [
    read('./content/posts/*'),
    params,
    frontmatter,
    markdown,
    sort,
    pager,
    defaults,
    render(path.join(directory, 'posts/:slug/index.html'), renderer('post.html')),
    first,
    render(path.join(directory, 'index.html'), renderer('post.html'))
  ]

  archivePage = [
    read('./content/posts.md'),
    frontmatter,
    markdown,
    collection('posts', [
      read('./content/posts/*'),
      params,
      frontmatter,
      markdown,
      sort
    ]),
    defaults,
    render(path.join(directory, 'posts/index.html'), renderer('posts.html'))
  ]

  _404Page = [
    read('./content/404.md'),
    frontmatter,
    markdown,
    defaults,
    render(path.join(directory, '404.html'), renderer('404.html'))
  ]

  return engine(postPages, archivePage, _404Page)
}

function base () {
  return gulp.src('base/**').pipe(gulp.dest(directory))
}

function css () {
  const cssnext = require('gulp-cssnext')
  const csso = require('gulp-csso')

  return gulp.src('css/site.css')
    .pipe(cssnext({
      features: {
        customProperties: {
          strict: false
        },
        rem: false,
        pseudoElements: false,
        colorRgba: false
      },
      browsers: ['> 5%', 'last 2 versions']
    }))
    .pipe(csso())
    .pipe(gulp.dest(directory))
}

function insertCSS (done) {
  const cheerio = require('gulp-cheerio')
  const foreach = require('gulp-foreach')
  const fs = require('fs')
  const postcss = require('postcss')
  const byebye = require('css-byebye')
  const discardEmpty = require('postcss-discard-empty')
  const minifySelectors = require('postcss-minify-selectors')
  const mergeRules = require('postcss-merge-rules')
  const pseudosRegex = /\:?(\:[a-z-]+)/g

  fs.readFile(path.join(directory, 'site.css'), 'utf-8', function (err, css) {
    if (err) {
      done(err)
    }

    gulp.src(path.join(directory, '**/**.html'))
      .pipe(foreach(function (stream, file) {
        return stream
          .pipe(cheerio(function ($) {
            const parsed = postcss.parse(css)
            var unused = []
            var output

            function trav (nodes) {
              nodes.forEach(function (node) {
                if (node.selector) {
                  node.selector
                    .split(',')
                    .map(function (selector) {
                      return selector.trim()
                    })
                    .forEach(function (selector) {
                      var _selector = selector.replace(pseudosRegex, function (selector, pseudo) {
                        return pseudo === ':not' ? selector : ''
                      })

                      try {
                        if (_selector && !$(_selector).length) {
                          unused.push(selector)
                        }
                      } catch (e) {
                        console.error(_selector)
                      }
                    })
                }

                if (node.nodes) {
                  trav(node.nodes)
                }
              })
            }

            trav(parsed.nodes)

            output = byebye.process(css, { rulesToRemove: unused })

            output = postcss(discardEmpty(), minifySelectors(), mergeRules()).process(output).css

            $('head').append(`<style type="text/css">${ output }</style>`)
          }))
      }))
      .pipe(gulp.dest(directory))
      .on('end', done)
  })
}

function minifyHTML () {
  const htmlmin = require('gulp-htmlmin')

  return gulp.src(path.join(directory, '**/**.html'))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(directory))
}

function icons (done) {
  const cheerio = require('gulp-cheerio')
  const fs = require('fs')
  const glob = require('glob')

  glob('./node_modules/geomicons-open/src/paths/*.d', function (err, files) {
    if (err) {
      done(err)
    }

    files = files.map(function (file) {
      return new Promise(function (resolve, reject) {
        fs.readFile(file, 'utf-8', function (err, content) {
          if (err) {
            reject(err)
          } else {
            resolve([path.basename(file, '.d'), content.split('\n').join('')])
          }
        })
      })
    })

    Promise.all(files).then(function (keyVals) {
      const map = new Map(keyVals)

      gulp.src(path.join(directory, '**/**.html'))
        .pipe(cheerio(function ($) {
          const defs = new Set()

          $('use').each(function () {
            const href = $(this).attr('xlink:href')
            const id = href.substring(1)

            if ($(`use[xlink\\:href="${ href }"]`).length > 1) {
              defs.add(id)
            } else {
              $(this).replaceWith(`<path d="${ map.get(id) }"/>`)
            }
          })

          if (defs.size) {
            let paths = []

            for (let id of defs) {
              paths.push(`<path d="${ map.get(id) }" id="${ id }"/>`)
            }

            $('body').append(`<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>${ paths.join('') }</defs></svg>`)
          }
        }))
        .pipe(gulp.dest(directory))
        .on('end', done)
    })
    .catch(done)
  })
}

function images () {
  const imageresize = require('gulp-image-resize')
  const changed = require('gulp-changed')
  const imagemin = require('gulp-imagemin')
  const merge = require('merge-stream')
  var merged
  var stream = gulp.src('content/uploads/*.jpg')
    .pipe(changed(path.join(directory, 'uploads')))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(path.join(directory, 'uploads')))

  merged = merge(stream)

  stream = gulp.src('content/uploads/*.jpg')
    .pipe(changed(path.join(directory, 'uploads')))
    .pipe(imageresize({
      width: 622,
      height: 0,
      imageMagick: true
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(path.join(directory, 'uploads/thumbnails/')))

  merged.add(stream)

  return merged
}

function watch () {
  gulp.watch('base/**/*', base)
  gulp.watch('content/uploads/**/*.jpg', images)
  gulp.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], gulp.series(gulp.parallel(gulp.series(pages, icons, minifyHTML), css), insertCSS))
}

function serve (done) {
  const express = require('express')
  const _static = require('express-static')
  const logger = require('express-log')
  const app = express()

  app.use(logger())

  app.use(_static(directory))

  app.use(function (req, res, next) {
    res.status(404)

    if (req.accepts('html')) {
      res.sendFile(path.resolve(directory, '404.html'), {}, function (err) {
        if (err) {
          res.type('txt').send('Not found')
        }
      })
    }
  })

  app.listen(8088, function () {
    console.log('server is running at %s', this.address().port)
  })

  done()
}
