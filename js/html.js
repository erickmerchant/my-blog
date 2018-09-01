const html = require('nanohtml')
const body = require('./body.js')
const host = 'https://erickmerchant.com'

module.exports = function ({ state, next }) {
  return html`<html lang="en">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${state.title}</title>
      <link href="/favicon.png" rel="shortcut icon" type="image/png">
      <link href="/css/index.css" rel="stylesheet" type="text/css">
      <link rel="canonical" href="${host}${state.location}">
    </head>
    ${body({ state, next })}
  </html>`
}
