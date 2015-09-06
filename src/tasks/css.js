'use strict'

const vinylFS = require('vinyl-fs')
const path = require('path')
const directory = require('./directory.js')
const cheerio = require('gulp-cheerio')
const Smallector = require('smallector')
const fs = require('fs')
const cssnext = require('cssnext')
const postcss = require('postcss')
const byebye = require('css-byebye')
const nano = require('cssnano')
const pseudosRegex = /\:?(\:[a-z-]+)/g

module.exports = function css (done) {

  fs.readFile('css/site.css', 'utf-8', function (err, css) {
    if (err) {
      done(err)
    }

    css = cssnext(
      css, {
        from: 'css/site.css',
        features: {
          customProperties: {
            strict: false
          },
          rem: false,
          pseudoElements: false,
          colorRgba: false
        }
      }
    )

    vinylFS.src(path.join(directory, '**/**.html'))
      .pipe(cheerio(function ($) {
        const parsed = postcss.parse(css)
        const unused = []
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

        output = postcss(nano()).process(output.compiled).css

        $('head').find('script').first().before(`<style type="text/css">${ output }</style>`)
      }))
      .pipe(vinylFS.dest(directory))
      .once('end', done)
  })
}
