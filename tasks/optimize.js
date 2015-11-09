'use strict'

const path = require('path')
const directory = require('./directory.js')
const htmlMinify = require('html-minifier').minify
const cheerio = require('cheerio')
const Smallector = require('smallector')
const fs = require('fs')
const smear = require('smear')
const thenify = require('thenify')
const fsReadFile = thenify(fs.readFile)
const fsWriteFile = thenify(fs.writeFile)
const fsReadOptions = {encoding: 'utf-8'}
const glob = thenify(require('glob'))
const postcss = require('postcss')
const byebye = require('css-byebye')
const nano = require('cssnano')
const pseudosRegex = /\:?(\:[a-z-]+)/g

module.exports = function minifyHTML () {
  return glob(path.join(directory, '**/**.html'))
  .then(function (files) {
    return Promise.all(files.map(function (file) {
      return Promise.all([
        fsReadFile(path.join(directory, 'site.css'), fsReadOptions)
        .then(function (css) {
          return Promise.resolve(postcss.parse(css))
        }),
        fsReadFile(path.join(directory, 'icons.svg'), fsReadOptions)
        .then(function (icons) {
          return Promise.resolve(cheerio.load(icons))
        })
      ])
      .then(smear(function (css, icons) {
        return fsReadFile(file)
        .then(function (html) {
          return Promise.resolve(cheerio.load(html))
        })
        .then(function ($) {
          const unused = []
          var output

          trav(css.nodes)

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

          return postcss([nano()]).process(output.compiled).then(function (output) {
            $('head').find('[rel=stylesheet]').replaceWith(`<style type="text/css">${ output.css }</style>`)

            return Promise.resolve($)
          })

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
        .then(function ($) {
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
                let cloned = icons('#' + id).clone()

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
              const el = icons('#' + id).clone()
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

          return Promise.resolve($)
        })
        .then(function ($) {
          return fsWriteFile(file, htmlMinify($.html(), {
            collapseWhitespace: true,
            removeComments: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            // removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeOptionalTags: true
          }))
        })
      }))
    }))
  })
}
