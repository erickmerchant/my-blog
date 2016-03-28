'use strict'

const thenify = require('thenify')
const fs = require('fs')
const fsReadFile = thenify(fs.readFile)
const fsWriteFile = thenify(fs.writeFile)
const chokidar = require('chokidar')
const cssnext = require('cssnext')
const path = require('path')

function css (destination) {
  return fsReadFile('css/site.css', 'utf-8')
  .then(function (css) {
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

    return fsWriteFile(path.join(destination, 'site.css'), css)
  })
}

css.watch = function (destination) {
  return css(destination).then(function () {
    chokidar.watch('css/**/*.css', {ignoreInitial: true}).on('all', function () {
      css(destination).catch(console.error)
    })

    return true
  })
}

module.exports = css
