'use strict'

const path = require('path')
const express = require('express')
const morgan = require('morgan')
const portfinder = require('portfinder')

module.exports = function (destination) {
  return function () {
    return new Promise(function (resolve, reject) {
      portfinder.getPort(function (err, port) {
        if (err) {
          reject(err)
        } else {
          const app = express()

          app.use(morgan('dev'))

          app.use(express.static(destination))

          app.use(function (req, res, next) {
            res.status(404)

            if (req.accepts('html')) {
              res.sendFile(path.resolve(destination, '404.html'), {}, function (err) {
                if (err) {
                  res.type('txt').send('Not found')
                }
              })
            }
          })

          app.listen(port, function () {
            console.log('server is running at %s', port)

            resolve()
          })
        }
      })
    })
  }
}
