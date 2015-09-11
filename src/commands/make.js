'use strict'

const chalk = require('chalk')
const moment = require('moment')
const mkslug = require('slug')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const cson = require('cson-parser')

module.exports = function (app) {
  app.command('make')
    .describe('Make new content')
    .option('time', 'prepend the unix timestamp')
    .action(function (dir, title, options, done) {
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

        mkdirp(path.dirname(file), function (err) {
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
    })
}
