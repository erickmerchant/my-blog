#!/usr/bin/env node
import del from 'del'
import {promisify} from 'util'
import fs from 'fs'
import cheerio from 'cheerio'
import execa from 'execa'
import {stringify} from '@erickmerchant/framework/stringify.js'
import {html} from '@erickmerchant/framework/main.js'
import {classes} from './src/css/styles.js'
import {createComponent} from './src/component.js'
import {contentComponent} from './src/common.js'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const options = {stdio: 'inherit', preferLocal: true}
const command = process.argv[2]

const program = async () => {
  try {
    if (command === 'start') {
      execa('css', ['src/styles.js', 'src/css/styles', '-wd'], options)

      execa(
        'css',
        ['src/editor/styles.js', 'src/editor/css/styles', '-wd'],
        options
      )

      execa('dev', ['serve', 'src', '-d', '-e', 'dev.html'], options)
    }

    if (command === 'build') {
      await Promise.all([
        execa('css', ['src/styles.js', 'src/css/styles'], options),
        execa('dev', ['cache', 'src', 'dist'], options)
      ])

      await del(['./dist/editor/', './dist/editor.html'])

      const paths = {
        index: './dist/index.html',
        styles: './dist/css/styles.css'
      }

      const state = {route: '', title: ''}
      const component = createComponent({
        classes,
        contentComponent,
        mainComponent: () =>
          html`
            <article></article>
          `,
        anchorAttrs: (href) => {
          return {href}
        }
      })

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

      await execa('rollup', ['-c', 'rollup.config.js'], options)
    }
  } catch (error) {
    console.error(error)

    process.exit(1)
  }
}

program()
