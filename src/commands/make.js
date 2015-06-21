'use strict'

var chalk = require('chalk')
var moment = require('moment')
var mkslug = require('slug')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var cson = require('cson-parser')

module.exports = function (app) {
  app.command('make', {
    description: 'Make new content',
    options: {
      '--time': 'prepend the unix timestamp'
    },
    aliases: {
      '-t': { time: true }
    }
  }, make)
}

function make (dir, title, options, done) {
  var file
  var content

  if (!title || !dir) {
    done(new Error('please provide a target dir and title'))
  } else {
    file = mkslug(title).toLowerCase()

    if (options.time) {
      file = [moment().format('x'), file].join('.')
    }

    file += '.md'

    if (dir) {
      file = path.join(dir, file)
    }

    content = ['---', cson.stringify({title: title}, null, '  '), '---', ''].join('\n')

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
}
