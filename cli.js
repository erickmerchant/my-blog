#!/usr/bin/env node
import {stringify} from '@erickmerchant/framework/stringify.js'
import cheerio from 'cheerio'
import execa from 'execa'
import fs from 'fs/promises'
import {copy} from 'fs-extra'

import {DEV, PROD, SSR} from './src/envs.js'

const command = process.argv[2]
const execOpts = {
  stdio: 'inherit'
}

try {
  if (command === 'start') {
    execa.command(
      `css src/styles/index.js src/assets/styles -dw src/styles`,
      execOpts
    )

    execa.command(
      `css src/editor/styles/index.js src/assets/editor/styles -dw src/editor/styles`,
      execOpts
    )

    execa.command(`dev serve -a ${DEV} -e index.html -d src`, execOpts)
  }

  if (command === 'build') {
    execa.command(`dev serve -a ${PROD} -e index.html src`, execOpts)

    await execa.command(`css src/styles/index.js src/assets/styles`, execOpts)

    await Promise.all(
      [
        'assets',
        'content',
        '_headers',
        '_redirects',
        'favicon.svg',
        'robots.txt'
      ].map((file) => copy(`src/${file}`, `dist/${file}`))
    )

    const {_main} = await import('./src/app.js')

    const $new = cheerio.load(stringify(_main(SSR)))

    const $body = $new('body')

    await Promise.all([
      execa.command(`rollup -c rollup.config.mjs`, execOpts),
      execa.command(
        `postcss ./dist/assets/styles/index.css --no-map -u postcss-clean -o ./dist/assets/styles/index.css`,
        execOpts
      )
    ])

    const [rawHtml, styles] = await Promise.all([
      fs.readFile('./src/index.html', 'utf8'),
      fs.readFile('./dist/assets/styles/index.css', 'utf8')
    ])

    const $raw = cheerio.load(rawHtml)

    $raw('head').append(`
      <script
        src="https://cdn.usefathom.com/script.js"
        data-spa="auto"
        data-site="WEFOJNWB"
        defer
      ></script>
    `)

    $raw('link[rel="stylesheet"]').replaceWith(`<style>${styles}</style>`)

    $raw('body').attr('class', $body.attr('class')).prepend($body.find('> *'))

    await fs.writeFile('./dist/index.html', $raw.html())

    process.exit(0)
  }
} catch (error) {
  console.error(error)

  process.exit(1)
}
