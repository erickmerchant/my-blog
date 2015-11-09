'use strict'

const sergeant = require('sergeant')
const argv = sergeant.parse()

module.exports = argv.options.dir || '../erickmerchant.github.io'
