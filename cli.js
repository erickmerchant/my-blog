#!/usr/bin/env node
import {stringify} from '@erickmerchant/framework/stringify.js';
import toml from '@iarna/toml';
import cheerio from 'cheerio';
import execa from 'execa';
import fs from 'fs/promises';
import {copy} from 'fs-extra';
import {globby} from 'globby';
import {fromMarkdown} from 'mdast-util-from-markdown';

import {DEV, PROD, SSR} from './src/envs.js';

const command = process.argv[2];
const execOpts = {
  stdio: 'inherit',
};

try {
  const files = await globby(['src/content/*.md']);
  const filePattern = /\d{4}-\d{2}-\d{2}-(.*?).md$/;

  await fs.mkdir('src/assets/content/', {recursive: true});

  for (let i = 0; i < files.length; i++) {
    const text = await fs.readFile(files[i], 'utf8');

    const [, data, content] = text.split('+++');

    const post = toml.parse(data);

    post.previous = files[i - 1]?.match(filePattern)?.[1] ?? null;
    post.next = files[i + 1]?.match(filePattern)?.[1] ?? null;

    post.content = fromMarkdown(content)?.children;

    const json = JSON.stringify(post, (key, value) => {
      if (key !== 'position') return value;
    });

    if (files[i + 1] == null) {
      await fs.writeFile('src/assets/content/_latest.json', json);
    }

    await fs.writeFile(`src/assets/content/${post.slug}.json`, json);
  }

  if (command === 'start') {
    execa.command(
      `css -i src/styles/index.js -o src/assets/styles -dw`,
      execOpts
    );

    execa.command(`dev -a ${DEV} -ds src`, execOpts);
  }

  if (command === 'build') {
    execa.command(`dev -a ${PROD} -s src`, execOpts);

    await execa.command(
      `css -i src/styles/index.js -o src/assets/styles`,
      execOpts
    );

    await Promise.all(
      [
        'assets',
        'content',
        '_headers',
        '_redirects',
        'favicon.svg',
        'robots.txt',
      ].map((file) => copy(`src/${file}`, `dist/${file}`))
    );

    const {_main} = await import('./src/app.js');

    const $new = cheerio.load(stringify(await _main(SSR)));

    const $body = $new('body');

    await Promise.all([
      execa.command(`rollup -c rollup.config.mjs`, execOpts),
      execa.command(
        `postcss ./dist/assets/styles/index.css --no-map -u postcss-clean -o ./dist/assets/styles/index.css`,
        execOpts
      ),
    ]);

    const [rawHtml, styles] = await Promise.all([
      fs.readFile('./src/index.html', 'utf8'),
      fs.readFile('./dist/assets/styles/index.css', 'utf8'),
    ]);

    const $raw = cheerio.load(rawHtml);

    $raw('link[rel="stylesheet"]').replaceWith(`<style>${styles}</style>`);

    $raw('body').attr('class', $body.attr('class')).prepend($body.find('> *'));

    await fs.writeFile('./dist/index.html', $raw.html());

    process.exit(0);
  }
} catch (error) {
  console.error(error);

  process.exit(1);
}
