+++
title = "NPM prepare script pitfall"
slug = "npm-prepare-script-pitfall"
date = 2016-11-27
+++

Today I learned that if you run `npm publish` with sudo and have a prepare script that runs babel, that script will fail to actually run.

```json
{
  "name": "@erickmerchant/example",
  "version": "1.0.0",
  "description": "An example",
  "main": "dist/main.js",
  "scripts": {
    "prepare": "babel --presets es2015 main.js -d dist/"
  },
  "devDependencies": {
    "babel-cli": "^6.10.1",
    "babel-preset-es2015": "^6.9.0"
  }
}
```

For instance trying to `sudo npm publish` a package with the above package.json you'd get the error "npm WARN lifecycle @erickmerchant/example@1.0.0~prepare: cannot run in wd %s %s (wd=%s) @erickmerchant/example@1.0.0 npm run build /Users/erickmerchant/Code/example".

Your package will publish correctly, essentially publishing a broken version. In my case it just published the last code that was actually transpiled with `npm run prepare`. You should never `npm publish` with sudo. You should also never really need to use sudo with npm.

# Some links

- [About scripts](https://docs.npmjs.com/misc/scripts)
- [Highly recommended package to make publishing easier](https://www.npmjs.com/package/np)
- [A useful video about fixing npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions)
