/* global window */

export default (url) => window.fetch(url).then((response) => {
  if (url.endsWith('.json')) return response.json()

  return response.text()
})
