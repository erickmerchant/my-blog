'use strict'

const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')
const htmlmin = require('gulp-htmlmin')
const cheerio = require('gulp-cheerio')
const Smallector = require('smallector')
const fs = require('fs')
const postcss = require('postcss')
const byebye = require('css-byebye')
const nano = require('cssnano')
const pseudosRegex = /\:?(\:[a-z-]+)/g

module.exports = function minifyHTML () {
  return new Promise(function (resolve, reject) {
    vinylFS.src(path.join(directory, '**/**.html'))
      .pipe(cheerio(function ($, file, done) {
        vinylFS.src(path.join(directory, 'icons.svg')).pipe(cheerio(function ($icons) {
          const defs = new Set()

          $('use').each(function () {
            const href = $(this).attr('xlink:href')

            if (href.indexOf('#') > -1) {
              const id = href.substring(href.indexOf('#') + 1)
              const classes = $(this).parent().attr('class')

              if ($(`use[xlink\\:href="${ href }"], use[xlink\\:href="#${ id }"]`).length > 1) {
                $(this).attr('xlink:href', '#' + id)
                defs.add(id)
              } else {
                let cloned = $icons('#' + id).clone()

                cloned.attr('class', classes)
                cloned.attr('id', null)
                cloned.attr('width', null)
                cloned.attr('height', null)
                cloned.attr('fill', null)

                $(this).parent().replaceWith(cloned)
              }
            }
          })

          if (defs.size) {
            const paths = []

            for (let id of defs) {
              const el = $icons('#' + id).clone()
              const children = el.children()

              if (children.length > 1) {
                paths.push(`<g id="${ id }">${ el.html() }</g>`)
              } else {
                children.attr('id', id)

                paths.push(el.html())
              }
            }

            $('body').append(`<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>${ paths.join('') }</defs></svg>`)
          }

          done()
        }))
      }))
      .pipe(cheerio(function ($, file, done) {
        fs.readFile(path.join(directory, 'site.css'), function (err, css) {
          const parsed = postcss.parse(css)
          const unused = []
          var output

          if (err) {
            done(err)
          } else {
            trav(parsed.nodes)

            output = new Smallector(postcss(byebye({ rulesToRemove: unused })).process(css).css, { compress: true })

            $('[class]').each(function () {
              var classes = $(this).attr('class').split(' ')

              classes = classes.map(function (v, k) {
                if (output.map[v]) {
                  return output.map[v]
                }
              })

              $(this).attr('class', classes.join(' ') || null)
            })

            postcss([nano()]).process(output.compiled).then(function (output) {
              $('head').find('[rel=stylesheet]').replaceWith(`<style type="text/css">${ output.css }</style>`)

              done()
            })
          }

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

                    if (_selector && !$(_selector).length) {
                      unused.push(selector)
                    }
                  })
              }

              if (node.nodes) {
                trav(node.nodes)
              }
            })
          }
        })
      }))
      .pipe(htmlmin({
        minifyJS: true,
        collapseWhitespace: true
      }))
      .pipe(vinylFS.dest(directory))
      .once('end', resolve)
      .on('error', reject)
  })
}
