'use strict'

const path = require('path')
const thenify = require('thenify')
const fsExtra = require('fs-extra')
const fsCopy = thenify(fsExtra.copy)
const glob = thenify(require('glob'))
const chokidar = require('chokidar')
const directory = require('./directory.js')

function base () {
  return glob('base/*').then(function (files) {
    return Promise.all(files.map(function (file) {
      return fsCopy(file, path.join(directory, path.basename(file)), {clobber: true})
    }))
  })
}

base.watch = function () {
  return base().then(function () {
    chokidar.watch('base/*').on('all', function () {
      base().catch(console.error)
    })

    return true
  })
}

module.exports = base
