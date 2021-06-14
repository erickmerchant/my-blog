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
    execa.command(
      `css src/styles/index.js src/asset/styles -dw src/styles`,
      execOpts
    )

    execa.command(
      `css src/editor/styles/index.js src/asset/editor/styles -dw src/editor/styles`,
      execOpts
    )

    execa.command(`dev serve -e index.html -d src`, execOpts)
  }

  if (command === 'build') {
    await execa.command(`css src/styles/index.js src/asset/styles`, execOpts)

    await execa.command(`dev cache -e index.html src dist`, execOpts)

    const {layoutClasses, aboutClasses} = await import(
      './src/asset/styles/index.js'
    )

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

    const newHtml = stringify(layoutView({title: ''}))

    const $body = cheerio.load(newHtml)('body')

    $('body').attr('class', $body.attr('class'))

    $('body').prepend($body.find('> *'))

    await Promise.all([
      fs.writeFile('./dist/index.html', $.html()),
      del([
        './dist/node_modules/',
        './dist/asset/',
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
