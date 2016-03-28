'use strict'

const fs = require('fs-extra')
const thenify = require('thenify')
const fsCopy = thenify(fs.copy)
const chokidar = require('chokidar')
const path = require('path')

function icons (destination) {
  return fsCopy('node_modules/geomicons-open/dist/geomicons.svg', path.join(destination, 'icons.svg'), {clobber: true})
}

icons.watch = function (destination) {
  return icons(destination).then(function () {
    chokidar.watch('node_modules/geomicons-open/dist/geomicons.svg', {ignoreInitial: true}).on('all', function () {
      icons(destination).catch(console.error)
    })

    return true
  })
}

module.exports = icons
