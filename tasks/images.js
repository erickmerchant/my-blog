'use strict'

const path = require('path')
const chokidar = require('chokidar')
const directory = require('./directory.js')
const sharp = require('sharp')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const glob = thenify(require('glob'))

function images () {
  return mkdirp(path.join(directory, 'uploads/thumbnails/'))
  .then(function () {
    return glob('content/uploads/*.jpg')
    .then(function (files) {
      return Promise.all(files.map(function (file) {
        return sharp(file).resize(622).progressive().toFile(path.join(directory, 'uploads/thumbnails/', path.basename(file)))
      }))
    })
  })
}

images.watch = function () {
  return images().then(function () {
    chokidar.watch('content/uploads/**/*.jpg').on('all', function () {
      images().catch(console.error)
    })

    return true
  })
}

module.exports = images
