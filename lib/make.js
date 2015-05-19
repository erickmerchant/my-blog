'use strict'

var chalk = require('chalk')
var moment = require('moment')
var mkslug = require('slug')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var cson = require('cson-parser')

module.exports = function make (done) {
  var file
  var content

  file = mkslug(this.title).toLowerCase()

  if (this.options.time) {
    file = [moment().format('x'), file].join('.')
  }

  file += '.md'

  if (this.dir) {
    file = path.join(this.dir, file)
  }

  content = ['---', cson.stringify({title: this.title}, null, '  '), '---', ''].join('\n')

  var directory = path.dirname(file)

  mkdirp(directory, function (err) {
    if (err) {
      done(err)
    } else {
      fs.writeFile(file, content, function (err) {
        if (err) {
          done(err)
        } else {
          console.log(chalk.green('%s saved.'), file)

          done()
        }
      })
    }
  })
}
