'use strict'

const path = require('path')
const htmlMinify = require('html-minifier').minify
const cheerio = require('cheerio')
const Smallector = require('smallector')
const fs = require('fs')
const thenify = require('thenify')
const fsReadFile = thenify(fs.readFile)
const fsWriteFile = thenify(fs.writeFile)
const fsReadOptions = {encoding: 'utf-8'}
const glob = thenify(require('glob'))
const postcss = require('postcss')
const byebye = require('css-byebye')
const nano = require('cssnano')
const pseudosRegex = /:?(:[a-z-]+)/g
const map = require('promise-map')

module.exports = function (destination) {
  return function () {
    const assetPromise = Promise.all([
      fsReadFile(path.join(destination, 'site.css'), fsReadOptions),
      fsReadFile(path.join(destination, 'icons.svg'), fsReadOptions)
      .then(function (icons) {
        return cheerio.load(icons)
      })
    ])

    return glob(path.join(destination, '**/**.html'))
    .then(map(function (file) {
      return assetPromise
      .then(function ([css, icons]) {
        css = postcss.parse(css)

        return fsReadFile(file)
        .then(function (html) {
          return cheerio.load(html)
        })
        .then(function ($) {
          const unused = []
          var output

          trav(css.nodes)

          output = new Smallector(postcss(byebye({ rulesToRemove: unused })).process(css).css)

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
            $('head').find('[rel=stylesheet]').replaceWith(`<style type="text/css">${output.css}</style>`)

            return $
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

              if ($(`use[xlink\\:href="${href}"], use[xlink\\:href="#${id}"]`).length > 1) {
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
                paths.push(`<g id="${id}">${el.html()}</g>`)
              } else {
                children.attr('id', id)

                paths.push(el.html())
              }
            }

            $('body').append(`<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>${paths.join('')}</defs></svg>`)
          }

          return $
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
      })
    }))
  }
}
