<p>Imagine you work on a project that has many files and you have a build process that bundles everything together to deliver to the frontend. This could be js that you're bundling together with Browserify, css that you're using PostCSS to preprocess, Sass, etc. As time goes on you may start to suspect that you have files that you're not even using anywhere. It's easy enough to know when you import a file that doesn't exist, but unused files are trickier to find. If you're generating a source map though it's not impossible.

<p>Say you have a src directory with the following files.

<ul>
  <li>a.js
  <li>b.js
  <li>c.js
</ul>

<p>Your build process is an npm script called build that runs <code>browserify -d ./src/a.js | exorcist a.js.map > a.js</code> which results in the following source map.

``` javascript
{
  "version": 3,
  "sources": [
    "node_modules/browser-pack/_prelude.js",
    "src/a.js",
    "src/b.js"
  ],
  "names": [],
  "mappings": "AAAA;ACAA;AACA;;ACDA",
  "file": "generated.js",
  "sourceRoot": "",
  "sourcesContent": [
    "(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})",
    "require('./b')\n",
    ""
  ]
}
```

<p>You can simply look at the sources property of the source map and see that c.js is not being used at all. In a large project this method of just comparing the source map's sources to the file system won't be pleasant. I've created a node package called ghost-hunter to help.

<h2>Installation</h2>

<pre>
  <code>
  npm install -g ghost-hunter
  </code>
</pre>

<h2>Usage</h2>

<pre>
  <code>
  ghost-hunter a.js.map ./src/**/*.js
  </code>
</pre>

