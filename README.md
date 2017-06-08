# Webpack Extraneous File Cleanup Plugin

A webpack plugin to remove unwanted files which may have been created and output due to multiple entry points

https://github.com/AnujRNair/webpack-extraneous-file-cleanup-plugin

## Usage

In your `webpack.config.js` file:

```js
import ExtraneousFileCleanupPlugin from 'webpack-extraneous-file-cleanup-plugin';

module.exports = {
  ...
  plugins: [
    new ExtraneousFileCleanupPlugin(opts)
  ]
}
```

## Configuration

The ExtraneousFileCleanupPlugin accepts an object of options with the following signature:

```js
{
  extensions: ['.extensions', '.to', 'whitelist'],
  minBytes: 1024,
  manifestJsonName: 'manifest.json'
}
```

* `extensions` - a list of extensions we're allowed to analyze for their file size. Useful for not removing small `.js.map` files, or small `.css` files.
* `minBytes` - the minimum byte size a file has to meet to not be deleted.
* `manifestJsonName` - if you're outputting a `manifest.json` file, this plugin will also remove deleted files from the manifest.
