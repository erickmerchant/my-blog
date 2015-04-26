'use strict'

const directory = '../erickmerchant.github.io/'
const path = require('path')
const gulp = require('gulp')
const htmlCSSSeries = gulp.series(gulp.parallel(gulp.series(pages, icons, minifyHTML), css), insertCSS)
const allParallel = gulp.parallel(base, htmlCSSSeries, images)
var optimize = false

gulp.task('default', gulp.series(optimizeOn, allParallel, gitStatus))

gulp.task('dev', gulp.parallel(allParallel, watch, serve))

gulp.task('preview', serve)

function optimizeOn (done) {
  optimize = true
  done()
}

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
  const content = require('static-engine-content')
  const pager = require('static-engine-pager')
  const first = require('static-engine-first')
  const collection = require('static-engine-collection')
  const render = require('static-engine-render')
  const hljs = require('highlight.js')
  const cson = require('cson-parser')
  var defaults = require('static-engine-defaults')
  var marked = require('static-engine-converter-marked')
  var file = require('static-engine-converter-file')
  var frontmatter = require('static-engine-converter-frontmatter')
  var sort = require('static-engine-sort')
  var postPages, archivePage, _404Page

  function renderer (file) {
    return function (page, done) {
      swig.renderFile(path.join('./templates/', file), page, done)
    }
  }

  swig.setDefaults({ cache: false })

  frontmatter = frontmatter(cson.parse)

  marked = marked({
    highlight: function (code) {
      return hljs.highlightAuto(code).value
    }
  })

  file = file('./content/:categories+/:date.:slug.md', {
    date: function (date) {
      return moment(date, 'x')
    }
  })

  sort = sort(function (a, b) {
    return b.date.diff(a.date)
  })

  defaults = defaults('./content/defaults.cson', cson.parse)

  postPages = [
    content('./content/posts/*'),
    file,
    frontmatter,
    marked,
    sort,
    pager,
    defaults,
    render(path.join(directory, 'posts/:slug/index.html'), renderer('post.html')),
    first,
    render(path.join(directory, 'index.html'), renderer('post.html'))
  ]

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
    render(path.join(directory, 'posts/index.html'), renderer('posts.html'))
  ]

  _404Page = [
    content('./content/404.md'),
    frontmatter,
    marked,
    defaults,
    render(path.join(directory, '404.html'), renderer('404.html'))
  ]

  return engine(postPages, archivePage, _404Page)
}

function base () {
  return gulp.src('base/**').pipe(gulp.dest(directory))
}

function css (done) {
  const cssnext = require('gulp-cssnext')
  const concat = require('gulp-concat')

  gulp.src([
      'css/site.css',
      'node_modules/highlight.js/styles/monokai_sublime.css'
    ])
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
    .pipe(concat('index.css'))
    .pipe(gulp.dest(directory))
    .on('end', done)
}

function insertCSS (done) {
  const tap = require('gulp-tap')
  const csso = require('gulp-csso')
  const cheerio = require('gulp-cheerio')
  const glob = require('glob')
  const uncss = require('gulp-uncss')

  if (optimize) {
    glob(path.join(directory, '**/**.html'), function (err, htmls) {
      if (err) {
        done(err)
      }

      function inline (html, next) {
        return gulp.src(path.join(directory, 'index.css'))
          .pipe(uncss({
            html: [html]
          }))
          .pipe(csso())
          .pipe(tap(function (file) {
            const selectors = require('gulp-selectors')

            gulp.src([html])
              .pipe(cheerio(function ($) {
                $('[rel="stylesheet"][href="/index.css"]').replaceWith(`<style type="text/css">${ file.contents.toString() }</style>`)
              }))
              .pipe(selectors.run({ 'css': ['html'], 'html': ['html'] }, { ids: true }))
              .pipe(gulp.dest(path.dirname(html)))
              .on('end', next)
          }))
      }

      function next () {
        if (htmls.length) {
          inline(htmls.shift(), next)
        } else {
          done()
        }
      }

      inline(htmls.shift(), next)
    })
  } else {
    done()
  }
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
  gulp.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], htmlCSSSeries)
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
