# Webpack Extraneous File Cleanup Plugin

A webpack plugin to remove unwanted files which may have been created and output due to multiple entry points

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
  manifestJsonName: 'manifest.json'
})
```

* `extensions` - a list of extensions we're allowed to analyze for their file size. Useful for not removing small `.js.map` files, or small `.css` files. Defaults to analyzing all file types.
* `minBytes` - the minimum byte size a file has to meet to not be deleted. Defaaults to 1024 bytes.
* `manifestJsonName` - if you're outputting a `manifest.json` file, this plugin will also remove deleted files from the manifest. Defaults to `manifest.json`
