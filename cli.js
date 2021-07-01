#!/usr/bin/env node
import {stringify} from '@erickmerchant/framework/stringify.js'
import cheerio from 'cheerio'
import del from 'del'
import execa from 'execa'
import fs from 'fs/promises'

import {DEV, PROD, SSR} from './src/envs.js'

const command = process.argv[2]
const execOpts = {
  stdio: 'inherit'
}

try {
  if (command === 'start') {
    execa.command(
      `css src/styles/index.js src/asset/styles -dw src/styles`,
      execOpts
    )

    execa.command(
      `css src/editor/styles/index.js src/asset/editor/styles -dw src/editor/styles`,
      execOpts
    )

    execa.command(`dev serve -a ${DEV} -e index.html -d src`, execOpts)
  }

  if (command === 'build') {
    await execa.command(`css src/styles/index.js src/asset/styles`, execOpts)

    await execa.command(`dev cache -a ${PROD} -e index.html src dist`, execOpts)

    const {_main} = await import('./src/app.js')

    const newHtml = stringify(_main(SSR))

    await Promise.all([
      execa.command(`rollup -c rollup.config.js`, execOpts),
      execa.command(
        `postcss ./dist/asset/styles/index.css --no-map -u postcss-clean -o ./dist/asset/styles/index.css`,
        execOpts
      )
    ])

    const [rawHtml, styles] = await Promise.all([
      fs.readFile('./dist/index.html', 'utf8'),
      fs.readFile('./dist/asset/styles/index.css', 'utf8')
    ])

    const $ = cheerio.load(rawHtml)

    $('link[rel="stylesheet"]').replaceWith(`<style>${styles}</style>`)

    const $body = cheerio.load(newHtml)('body')

    $('body').attr('class', $body.attr('class'))

    $('body').prepend($body.find('> *'))

    await Promise.all([
      fs.writeFile('./dist/index.html', $.html()),
      del([
        './dist/node_modules/',
        './dist/asset/',
        './dist/content/raw/',
        './dist/styles/',
        './dist/views/',
        './dist/editor/',
        './dist/editor.html',
        './dist/*.{js,css}',
        '!./dist/app.js'
      ])
    ])
  }
} catch (error) {
  console.error(error)

  process.exit(1)
}
