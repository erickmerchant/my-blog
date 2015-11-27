'use strict'

const path = require('path')
const chokidar = require('chokidar')
const directory = require('./directory.js')
const sharp = require('sharp')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const glob = thenify(require('glob'))
const map = require('promise-map')

function images () {
  return mkdirp(path.join(directory, 'uploads/thumbnails/'))
  .then(function () {
    return glob('content/uploads/*.jpg')
    .then(map(function (file) {
      return sharp(file).resize(622).quality(75).progressive().toFile(path.join(directory, 'uploads/thumbnails/', path.basename(file)))
    }))
  })
}

images.watch = function () {
  return images().then(function () {
    chokidar.watch('content/uploads/**/*.jpg', {ignoreInitial: true}).on('all', function () {
      images().catch(console.error)
    })

    return true
  })
}

module.exports = images
