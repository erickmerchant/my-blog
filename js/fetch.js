if (typeof window !== 'undefined') {
  module.exports = (url) => {
    return window.fetch(url).then((response) => {
      if (url.endsWith('.json')) return response.json()

      return response.text()
    })
  }
} else {
  const fs = require('fs')

  module.exports = (url) => {
    return new Promise((resolve, reject) => {
      fs.readFile('./content' + url, 'utf8', (err, response) => {
        if (err) {
          reject(err)
        } else if (url.endsWith('.json')) {
          resolve(JSON.parse(response))
        } else {
          resolve(response)
        }
      })
    })
  }
}
