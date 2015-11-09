'use strict'

const fs = require('fs-extra')
const chokidar = require('chokidar')
const directory = require('./directory.js')

function base () {
  return new Promise(function (resolve, reject) {
    fs.copy('base/', directory, {clobber: true}, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

base.watch = function () {
  chokidar.watch('base/**/*').on('all', function () {
    base()
  })

  return base()
}

module.exports = base
