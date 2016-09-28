'use strict'

const path = require('path')
const chokidar = require('chokidar')
const sharp = require('sharp')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const glob = thenify(require('glob'))
const map = require('promise-map')

function images (destination) {
  return mkdirp(path.join(destination, 'uploads/thumbnails/'))
  .then(function () {
    return glob('content/uploads/*.jpg')
    .then(map(function (file) {
      return sharp(file).resize(640).quality(80).progressive().toFile(path.join(destination, 'uploads/thumbnails/', path.basename(file)))
    }))
  })
}

images.watch = function (destination) {
  return images(destination).then(function () {
    chokidar.watch('content/uploads/**/*.jpg', {ignoreInitial: true}).on('all', function () {
      images(destination).catch(console.error)
    })

    return true
  })
}

module.exports = images
