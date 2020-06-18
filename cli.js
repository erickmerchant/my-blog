#!/usr/bin/env node
import sergeant from 'sergeant'
import del from 'del'
import {promisify} from 'util'
import fs from 'fs'
import cheerio from 'cheerio'
import execa from 'execa'
import {stringify} from '@erickmerchant/framework/stringify.js'

const {command, start} = sergeant('cli.js')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const execaOptions = {shell: true, stdio: 'inherit', cwd: process.cwd()}

command({
  name: 'start',
  async action() {
    execa('css src/styles.js src/css/styles -wd', execaOptions)

    execa('css src/editor/styles.js src/editor/css/styles -wd', execaOptions)

    execa('dev serve src -d -e dev.html', execaOptions)
  }
})

command({
  name: 'build',
  async action() {
    await Promise.all([
      execa('css src/styles.js src/css/styles', execaOptions),
      execa('dev cache src dist', execaOptions)
    ])

    await del(['./dist/editor/', './dist/editor.html'])

    const paths = {
      index: './dist/index.html',
      styles: './dist/css/styles.css'
    }

    const [
      {classes},
      {createComponent},
      {getSegments, contentComponent}
    ] = await Promise.all([
      import('./src/css/styles.js'),
      import('./src/main.js'),
      import('./src/common.js')
    ])

    const state = {route: '', title: ''}
    const component = createComponent(
      {},
      classes,
      () => {},
      getSegments,
      contentComponent
    )

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
