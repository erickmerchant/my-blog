#!/usr/bin/env node
const {command, start} = require('sergeant')('cli.js')
const del = require('del')
const promisify = require('util').promisify
const fs = require('fs')
const cheerio = require('cheerio')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const execa = require('execa')
const execaOptions = {shell: true, stdio: 'inherit', cwd: process.cwd()}

command({
  name: 'start',
  async action() {
    execa('css src/styles.mjs src/css/styles -wd', execaOptions)

    execa('css src/editor/styles.mjs src/editor/css/styles -wd', execaOptions)

    execa('dev serve -m src/app.importmap src -d', execaOptions)
  }
})

command({
  name: 'build',
  async action() {
    await Promise.all([
      execa('css src/styles.mjs src/css/styles', execaOptions),
      execa('dev cache -m src/app.importmap src dist', execaOptions)
    ])

    await del(['./dist/editor/'])

    const paths = {
      index: './dist/index.html',
      styles: './dist/css/styles.css'
    }

    const {stringify} = await import('@erickmerchant/framework/stringify.mjs')
    const {component} = await import('./src/app.mjs')
    const state = {route: '', title: ''}

    const $body = cheerio.load(stringify(component(state)))('body')

    $body.find('*').each((index, el) => {
      let node = el.firstChild

      while (node) {
        if (node.nodeType === 3) {
          node.nodeValue = node.nodeValue.replace(/\s+/g, ' ')
        }

        node = node.nextSibling
      }
    })

    const [index, styles] = await Promise.all(
      [paths.index, paths.styles].map((path) => readFile(path, 'utf8'))
    )

    const styleHTML = `<style>${styles}</style>`

    const $ = cheerio.load(index)

    $('link[rel="stylesheet"]').replaceWith(styleHTML)

    $('body').attr('class', $body.attr('class')).html($body.html())

    await writeFile(paths.index, $.html())

    await execa('rollup -c rollup.config.js', execaOptions)
  }
})

start(process.argv.slice(2))
