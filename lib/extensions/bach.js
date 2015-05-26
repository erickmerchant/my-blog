const bach = require('bach')
const chalk = require('chalk')
const pretty = require('pretty-hrtime')

const extensions = {
  create: function (fn) {
    return { name: fn.name || 'anonymous' }
  },
  before: function (storage) {
    storage.started = process.hrtime()

    console.log(chalk.magenta(storage.name) + ' starting ... ')
  },
  after: function (result, storage) {
    console.log(chalk.magenta(storage.name) + ' finished in ' + chalk.cyan(pretty(process.hrtime(storage.started))))
  }
}

module.exports = {
  series: function () {
    var args = [].slice.apply(arguments)

    args.push(extensions)

    return bach.series.apply(bach, args)
  },

  parallel: function () {
    var args = [].slice.apply(arguments)

    args.push(extensions)

    return bach.parallel.apply(bach, args)
  }
}
