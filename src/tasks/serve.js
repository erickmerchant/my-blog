'use strict'

const path = require('path')
const directory = require('./directory.js')
const express = require('express')
const _static = require('express-static')
const logger = require('express-log')

module.exports = function serve (done) {
  const app = express()

  app.use(logger())

  app.use(_static(directory))

  app.use(function (req, res, next) {
    res.status(404)

    if (req.accepts('html')) {
      res.sendFile(path.resolve(directory, '404.html'), {}, function (err) {
        if (err) {
          res.type('txt').send('Not found')
        }
      })
    }
  })

  app.listen(8088, function () {
    console.log('server is running at %s', this.address().port)
  })

  done()
}
