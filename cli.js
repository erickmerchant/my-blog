#!/usr/bin/env node
import {html} from '@erickmerchant/framework'
import {stringify} from '@erickmerchant/framework/stringify.js'
import cheerio from 'cheerio'
import del from 'del'
import execa from 'execa'
import fs from 'fs/promises'

import {createContentView} from './src/content.js'
import {createAboutView, getAboutContentTemplates} from './src/views/about.js'
import {createLayoutView} from './src/views/layout.js'

const command = process.argv[2]
const execOpts = {
  stdio: 'inherit'
}

try {
  if (command === 'start') {
    execa.command(`css src/styles/index.js dist/css -dw src/styles`, execOpts)

    execa.command(
      `css src/editor/styles/index.js dist/editor/css -dw src/editor/styles`,
      execOpts
    )

    execa.command(`dev serve -e index.html -d src dist`, execOpts)
  }

  if (command === 'build') {
    await Promise.all([
      execa.command(`css src/styles/index.js dist/css`, execOpts),
      execa.command(`dev cache -e index.html dist src`, execOpts)
    ])

    const {layoutClasses, aboutClasses} = await import('./dist/css/index.js')

    const aboutView = createAboutView({
      classes: aboutClasses,
      contentView: createContentView({
        templates: getAboutContentTemplates({classes: aboutClasses})
      })
    })

    const layoutView = createLayoutView({
      classes: layoutClasses,
      aboutView,
      mainView: () =>
        html`
          <main></main>
        `,
      anchorAttrs: (href) => {
        return {href}
      }
    })

    await Promise.all([
      execa.command(`rollup -c rollup.config.js`, execOpts),
      execa.command(
        `postcss ./dist/css/index.css --no-map -u postcss-clean -o ./dist/css/index.css`,
        execOpts
      )
    ])

    const [rawHtml, styles] = await Promise.all([
      fs.readFile('./dist/index.html', 'utf8'),
      fs.readFile('./dist/css/index.css', 'utf8')
    ])

    const $ = cheerio.load(rawHtml)

    $('link[rel="stylesheet"]').replaceWith(`<style>${styles}</style>`)

    const newHtml = stringify(layoutView({title: ''}))

    const $body = cheerio.load(newHtml)('body')

    $('body').attr('class', $body.attr('class'))

    $('body').prepend($body.find('> *'))

    await Promise.all([
      fs.writeFile('./dist/index.html', $.html()),
      del([
        './dist/node_modules/',
        './dist/css/',
        './dist/styles/',
        './dist/views/',
        './dist/*.{js,css}',
        '!./dist/app.js'
      ])
    ])
  }
} catch (error) {
  console.error(error)

  process.exit(1)
}
