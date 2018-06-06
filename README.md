# Webpack Extraneous File Cleanup Plugin

A webpack plugin to remove unwanted files which may have been created and output due to multiple entry points

## Problem

When using ExtractTextPlugin, it's not possible to generate a css file for each chunk webpack outputs, if you're using [code splitting](https://webpack.js.org/guides/code-splitting/).

The only possible way to do this is to have an entry point for each top level css / less / scss file, however this will create small js files with empty webpack functions in them, which are undesirable.

This plugin removes files which are under a certain byte size, after everything has been compiled and output. It can also remove these files from your `manifest.json` file if you are using the [webpack manifest plugin](https://github.com/danethurber/webpack-manifest-plugin) or something similar to it.

## Usage

Install using `npm` or `yarn`
```js
npm install webpack-extraneous-file-cleanup-plugin --save-dev
yarn add webpack-extraneous-file-cleanup-plugin --dev
```

In your `webpack.config.js` file:

```js
const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin');

module.exports = {
  ...
  plugins: [
    new ExtraneousFileCleanupPlugin(opts)
  ]
}
```

## Recommended Configuration

```js
new ExtraneousFileCleanupPlugin({
  extensions: ['.js']
})
```

## All Configuration Options

The ExtraneousFileCleanupPlugin accepts an object of options with the following attributes:

```js
new ExtraneousFileCleanupPlugin({
  extensions: ['.extensions', '.to', '.whitelist'],
  minBytes: 1024,
  manifestJsonName: 'manifest.json',
  paths: ['/dist/removeFromThisPath'],
  glob: [
    // glob patterns to delete
  ],
  globOptions: {
    // micromatch options for glob
  },
  ignoreGlob: {
    // glob patterns to ignore
  },
  ignoreGlobOptions: {
    // micromatch options for ignoreGlob
  }
})
```

* `extensions` - a list of extensions we're allowed to analyze for their file size. Useful for not removing small `.js.map` files, or small `.css` files. Defaults to analyzing all file types.
* `minBytes` - the minimum byte size a file has to meet to not be deleted. Defaults to 1024 bytes.
* `manifestJsonName` - if you're outputting a `manifest.json` file, this plugin will also remove deleted files from the manifest. Defaults to `manifest.json`
* `paths` - an array of strings to specify which if any paths you want to limit the searching to. If this is defined, files will only be removed from those paths.
* `glob` - an array of glob patterns to delete (see [micromatch](https://github.com/micromatch/micromatch)). If glob array is not empty, `minBytes` will be ignored.
* `globOptions` - optional [options](https://github.com/micromatch/micromatch#options) for `glob`
* `ignore` - an array of glob patterns to exclude from deletion (can be used together with `minBytes`)
* `ignoreOptions` - optional options for `ignore`
