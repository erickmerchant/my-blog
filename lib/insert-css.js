const vinylFS = require('vinyl-fs')
const path = require('path')
const directory = require('./directory.js')

module.exports = function insertCSS (done) {
  const cheerio = require('gulp-cheerio')
  const fs = require('fs')
  const postcss = require('postcss')
  const byebye = require('css-byebye')
  const nano = require('cssnano')
  const pseudosRegex = /\:?(\:[a-z-]+)/g

  fs.readFile(path.join(directory, 'site.css'), 'utf-8', function (err, css) {
    if (err) {
      done(err)
    }

    vinylFS.src(path.join(directory, '**/**.html'))
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

        output = postcss(nano()).process(output).css

        $('head').append(`<style type="text/css">${ output }</style>`)
      }))
      .pipe(vinylFS.dest(directory))
      .on('end', done)
  })
}
