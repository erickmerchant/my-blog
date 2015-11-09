'use strict'

const sergeant = require('sergeant')
const app = sergeant().describe('CMS for erickmerchant.com')
const chalk = require('chalk')
const moment = require('moment')
const mkslug = require('slug')
const thenify = require('thenify')
const fs = require('fs')
const fsWriteFile = thenify(fs.writeFile)
const fsRename = thenify(fs.rename)
const mkdirp = thenify(require('mkdirp'))
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
.parameter('dir', 'where is it')
.parameter('title', 'what is it called')
.action(function (params, options, done) {
  var file
  var content

  if (!params.title || !params.dir) {
    throw new Error('please provide a target dir and title')
  }

  file = mkslug(params.title).toLowerCase()

  if (options.time) {
    file = [moment().format('x'), file].join('.')
  }

  file += '.md'

  if (params.dir) {
    file = path.join(params.dir, file)
  }

  content = ['---', cson.stringify({title: params.title}, null, '  '), '---', ''].join('\n')

  return mkdirp(path.dirname(file))
  .then(function () {
    return fsWriteFile(file, content)
    .then(function () {
      console.log(chalk.green('%s saved.'), file)
    })
  })
})

app.command('move')
.describe('Move content')
.option('title', 'change the title')
.option('time', 'prepend the unix timestamp')
.alias('strip', { time: false })
.parameter('file', 'the file to move')
.parameter('dir', 'where to move it to')
.action(function (params, options, done) {
  var newFile
  var ext
  var parts
  var slug
  var time
  var destination
  var directory
  var hasTime = false

  if (!params.file) {
    throw new Error('please provide a file to move')
  }

  destination = params.dir ? params.dir : path.dirname(params.file)

  ext = path.extname(params.file)

  parts = path.basename(params.file, ext).split('.')

  slug = path.basename(params.file, ext)

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

  return mkdirp(directory)
  .then(function () {
    return fsRename(params.file, newFile, function () {
      console.log(chalk.green('%s moved to %s.'), params.file, newFile)
    })
  })
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
