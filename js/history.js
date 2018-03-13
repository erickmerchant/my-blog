if (typeof window !== 'undefined') {
  const createHistory = require('history').createBrowserHistory

  module.exports = createHistory()
} else {
  module.exports = {}
}
