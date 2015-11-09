'use strict'

const fs = require('fs-extra')
const chokidar = require('chokidar')
const directory = require('./directory.js')
const path = require('path')

function icons () {
  return new Promise(function (resolve, reject) {
    fs.copy('node_modules/geomicons-open/dist/geomicons.svg', path.join(directory, 'icons.svg'), {clobber: true}, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

icons.watch = function () {
  chokidar.watch('base/**/*').on('all', function () {
    icons()
  })

  return icons()
}

module.exports = icons
