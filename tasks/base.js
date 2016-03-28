'use strict'

const path = require('path')
const thenify = require('thenify')
const fsExtra = require('fs-extra')
const fsCopy = thenify(fsExtra.copy)
const glob = thenify(require('glob'))
const chokidar = require('chokidar')
const map = require('promise-map')

function base (destination) {
  return glob('base/*').then(map(function (file) {
    return fsCopy(file, path.join(destination, path.basename(file)), {clobber: true})
  }))
}

base.watch = function (destination) {
  return base(destination).then(function () {
    chokidar.watch('base/*', {ignoreInitial: true}).on('all', function () {
      base(destination).catch(console.error)
    })

    return true
  })
}

module.exports = base
