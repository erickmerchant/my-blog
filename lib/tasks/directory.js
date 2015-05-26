const sergeant = require('sergeant')
const argv = sergeant.parse()

module.exports = argv[argv.length - 1].dir || '../erickmerchant.github.io'
