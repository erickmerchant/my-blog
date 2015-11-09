'use strict'

const sergeant = require('sergeant')
const app = sergeant().describe('CMS for erickmerchant.com')
const chalk = require('chalk')
const moment = require('moment')
const mkslug = require('slug')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const cson = require('cson-parser')
const base = require('./tasks/base.js')
const pages = require('./tasks/pages.js')
const icons = require('./tasks/icons.js')
const css = require('./tasks/css.js')
const optimize = require('./tasks/optimize.js')
const images = require('./tasks/images.js')
const serve = require('./tasks/serve.js')

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

app.command('move')
.describe('Move content')
.option('title', 'change the title')
.option('time', 'prepend the unix timestamp')
.alias('strip', { time: false })
.action(function (args, options, done) {
  var newFile
  var ext
  var parts
  var slug
  var time
  var destination
  var directory
  var hasTime = false

  if (!args.file) {
    done(new Error('please provide a file to move'))
  } else {
    destination = args.dir ? args.dir : path.dirname(args.file)

    ext = path.extname(args.file)

    parts = path.basename(args.file, ext).split('.')

    slug = path.basename(args.file, ext)

    time = moment()

    if (parts.length >= 2) {
      if (moment(parts[0], ['x']).isValid()) {
        hasTime = true

        time = moment(parts[0], ['x'])

        slug = parts.slice(1).join('.')
      }
    }

    if (options.title) {
      slug = mkslug(options.title).toLowerCase()
    }

    newFile = slug + ext

    if (hasTime && options.time !== false || options.time) {
      newFile = [time.format('x'), newFile].join('.')
    }

    newFile = path.join(destination, newFile)

    directory = path.dirname(newFile)

    mkdirp(directory, function (err) {
      if (err) {
        done(err)
      } else {
        fs.rename(args.file, newFile, function (err) {
          if (err) {
            done(err)
          } else {
            console.log(chalk.green('%s moved to %s.'), args.file, newFile)

            done()
          }
        })
      }
    })
  }
})

app.command('update')
.describe('Build the site once')
.action(function () {
  return Promise.all([
    base(),
    images(),
    Promise.all([pages(), icons(), css()]).then(optimize)
  ])
})

app.command('watch')
.describe('Build the site then watch for changes. Run a server')
.action(function () {
  return Promise.all([
    base.watch(),
    images.watch(),
    css.watch(),
    pages.watch(),
    icons.watch()
  ])
  .then(serve)
})

app.command('preview')
.describe('Preview the built site')
.action(function () {
  serve()
})

app.run()
