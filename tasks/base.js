'use strict'

const thenify = require('thenify')
const fsExtra = require('fs-extra')
const fsCopy = thenify(fsExtra.copy)
const chokidar = require('chokidar')
const directory = require('./directory.js')

function base () {
  return fsCopy('base/', directory, {clobber: true})
}

base.watch = function () {
  chokidar.watch('base/**/*').on('all', function () {
    base()
  })

  return base()
}

module.exports = base
