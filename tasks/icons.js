'use strict'

const fs = require('fs-extra')
const thenify = require('thenify')
const fsCopy = thenify(fs.copy)
const chokidar = require('chokidar')
const directory = require('./directory.js')
const path = require('path')

function icons () {
  return fsCopy('node_modules/geomicons-open/dist/geomicons.svg', path.join(directory, 'icons.svg'), {clobber: true})
}

icons.watch = function () {
  chokidar.watch('node_modules/geomicons-open/dist/geomicons.svg').on('all', function () {
    icons()
  })

  return icons()
}

module.exports = icons
