'use strict'

const thenify = require('thenify')
const fs = require('fs')
const fsReadFile = thenify(fs.readFile)
const fsWriteFile = thenify(fs.writeFile)
const chokidar = require('chokidar')
const postcss = require('postcss')
const postcssPlugins = [
  require('postcss-import')(),
  require('postcss-inherit'),
  require('postcss-custom-media')(),
  require('postcss-custom-properties')(),
  require('postcss-calc')(),
  require('autoprefixer'),
  require('cssnano')()
]
const path = require('path')

function css (destination) {
  var src = 'css/site.css'
  var dest = path.join(destination, 'site.css')

  return fsReadFile(src, 'utf-8')
  .then(function (css) {
    return postcss(postcssPlugins).process(css, {
      from: src,
      to: dest
    }).then(function (output) {
      return fsWriteFile(dest, output.css)
    })
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
