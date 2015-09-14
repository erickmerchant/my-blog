'use strict'

const fs = require('fs')
const cssnext = require('cssnext')
const path = require('path')
const directory = require('./directory.js')

module.exports = function css () {
  return new Promise(function (resolve, reject) {
    fs.readFile('css/site.css', 'utf-8', function (err, css) {
      if (err) {
        reject(err)
      }

      css = cssnext(
        css, {
          from: 'css/site.css',
          features: {
            customProperties: {
              strict: false
            },
            rem: false,
            pseudoElements: false,
            colorRgba: false
          }
        }
      )

      fs.writeFile(path.join(directory, 'site.css'), css, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}
