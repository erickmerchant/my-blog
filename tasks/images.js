'use strict'

const path = require('path')
const chokidar = require('chokidar')
const directory = require('./directory.js')
const sharp = require('sharp')
const glob = require('glob')
const mkdirp = require('mkdirp')

function images () {
  return (new Promise(function (resolve, reject) {
    mkdirp(path.join(directory, 'uploads/thumbnails/'), function (err) {
      if (err) throw err

      glob('content/uploads/*.jpg', function (err, files) {
        if (err) throw err

        resolve(Promise.all(files.map(function (file) {
          return sharp(file).resize(622).progressive().toFile(path.join(directory, 'uploads/thumbnails/', path.basename(file)))
        })))
      })
    })
  }))
}

images.watch = function () {
  chokidar.watch('content/uploads/**/*.jpg').on('all', function () {
    images()
  })

  return images()
}

module.exports = images
