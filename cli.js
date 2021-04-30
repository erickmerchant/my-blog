#!/usr/bin/env node
import {html} from '@erickmerchant/framework'
import {stringify} from '@erickmerchant/framework/stringify.js'
import cheerio from 'cheerio'
import del from 'del'
import fs from 'fs'
import {spawn} from 'sergeant'
import {promisify} from 'util'

import {createContentView, getDefaultContentTemplates} from './src/content.js'
import {createAboutView, getAboutContentTemplates} from './src/views/about.js'
import {createLayoutView} from './src/views/layout.js'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const command = process.argv[2]

try {
  if (command === 'start') {
    spawn`css src/styles.js dist/css -dw src`

    spawn`css dev/editor/styles.js dist/editor/css -dw dev/editor`

    spawn`dev serve src dev dist -d`
  }

  if (command === 'build') {
    await Promise.all([
      spawn`css src/styles.js dist/css`,
      spawn`dev cache src dist`
    ])

    const {layoutClasses, aboutClasses} = await import('./dist/css/styles.js')

    const aboutView = createAboutView({
      classes: aboutClasses,
      contentView: createContentView({
        templates: Object.assign(
          getDefaultContentTemplates({classes: aboutClasses}),
          getAboutContentTemplates({classes: aboutClasses})
        )
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
      spawn`rollup -c rollup.config.js`,
      spawn`postcss ./dist/css/styles.css --no-map -u cssnano -o ./dist/css/styles.css`
    ])

    const [rawHtml, styles] = await Promise.all([
      readFile('./dist/index.html', 'utf8'),
      readFile('./dist/css/styles.css', 'utf8')
    ])

    const $ = cheerio.load(rawHtml)

    $('link[rel="stylesheet"]').replaceWith(`<style>${styles}</style>`)

    $('body').replaceWith(
      cheerio.load(stringify(layoutView({title: ''})))('body')
    )

    $('script').remove()

    $('body').append(`<script src="/app.js" type="module"></script>`)

    await Promise.all([
      writeFile('./dist/index.html', $.html()),
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
