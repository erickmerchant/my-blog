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
    .action(function (args, options, done) {
      var file
      var content

      if (!args.title || !args.dir) {
        done(new Error('please provide a target dir and title'))
      } else {
        file = mkslug(args.title).toLowerCase()

        if (options.time) {
          file = [moment().format('x'), file].join('.')
        }

        file += '.md'

        if (args.dir) {
          file = path.join(args.dir, file)
        }

        content = ['---', cson.stringify({title: args.title}, null, '  '), '---', ''].join('\n')

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
