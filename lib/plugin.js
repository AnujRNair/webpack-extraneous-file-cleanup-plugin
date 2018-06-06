const fs = require('fs')
const micromatch = require('micromatch')

function ExtraneousFileCleanupPlugin (options) {
  options = options || {}
  this.extensions = options.extensions || []
  this.minBytes = options.minBytes || 1024 // 1 KB minimum size
  this.manifestJsonName = options.manifestJsonName || 'manifest.json'
  this.paths = options.paths || []
  this.glob = options.glob || []
  this.globOptions = options.globOptions || {}
  this.ignore = options.ignore || []
  this.ignoreOptions = options.ignoreOptions || {}
}

// check if the extension is in our allowed list
ExtraneousFileCleanupPlugin.prototype.validExtension = function (fileName) {
  let i
  let len

  // all extensions are valid
  if (this.extensions.length === 0) {
    return true
  }

  for (i = 0, len = this.extensions.length; i < len; i++) {
    if (fileName.endsWith(this.extensions[i])) {
      return true
    }
  }

  return false
}

ExtraneousFileCleanupPlugin.prototype.removeFromWebpackStats = (compilation, assetKey) => {
  for (let i = 0, iLen = compilation.chunks.length; i < iLen; i++) {
    if (typeof compilation.chunks[i] === 'undefined') {
      continue
    }

    for (let j = 0, jLen = compilation.chunks[i].files.length; j < jLen; j++) {
      if (compilation.chunks[i].files[j] === assetKey) {
        compilation.chunks[i].files.splice(j, 1)
        return
      }
    }
  }
}

ExtraneousFileCleanupPlugin.prototype.removeAsset = (compilation, outputPath, assetKey, extension = '') => {
  // remove from various places
  try {
    fs.unlinkSync(outputPath + '/' + assetKey + extension)          // unlink the asset
    delete compilation.assets[assetKey]                 // remove from webpack output
  } catch (e) { }

}

ExtraneousFileCleanupPlugin.prototype.afterEmit = function (compilation) {
  const outputPath = compilation.options.output.path

  let manifestJson = {}
  let usingManifestJson = false
  let manifestOutputPath = outputPath + '/' + this.manifestJsonName
  let manifestKey
  let assetStat

  // if we're using the webpack manifest plugin, we need to make sure we clean that up too
  if (fs.existsSync(manifestOutputPath)) {
    usingManifestJson = true
    manifestJson = JSON.parse(fs.readFileSync(manifestOutputPath).toString())
  }

  // for all assets
  Object.keys(compilation.assets).forEach(assetKey => {
    if (!this.validExtension(assetKey)) {
      return
    }

    // Sometimes the file doesn't exists. Not really sure why. Return from function if it doesn't exist
    // statSync assumes the file exits and will throw an error otherwise
    const file = outputPath + '/' + assetKey;
    if (!fs.existsSync(file)) {
      return
    }

    // if we pass paths assume that we only want to remove assets from those paths
    if (
      this.paths.length > 0 &&
      !this.paths.some(path => (assetKey.startsWith(path) || ('/' + assetKey).startsWith(path)))
    ) {
      return
    }

    // if asset matches ignoreGlob, ignore it
    if (this.ignore.length && micromatch([assetKey], this.ignore, this.ignoreOptions).length > 0) {
      return
    }

    // if there are globs, do not look for filesize
    if (this.glob.length) {

      // if asset doesn't match glob, ignore it
      if (micromatch([assetKey], this.glob, this.globOptions).length === 0) {
        return
      }

    } else {

      // if it passes min byte check, ignore it
      assetStat = fs.statSync(file)
      if (assetStat.size > this.minBytes) {
        return
      }

    }

    this.removeAsset(compilation, outputPath, assetKey)

    // remove map file from various places if it exists
    this.removeAsset(compilation, outputPath, assetKey, '.map')

    if (usingManifestJson) {
      for (manifestKey in manifestJson) {
        if (manifestJson.hasOwnProperty(manifestKey) && manifestJson[manifestKey] === assetKey) {
          delete manifestJson[manifestKey]              // remove from manifest.json
          delete manifestJson[manifestKey + '.map']
        }
      }
    }

    this.removeFromWebpackStats(compilation, assetKey)  // remove from webpack stats
  })

  // write the new manifest.json file if we're using it
  if (usingManifestJson) {
    fs.writeFileSync(manifestOutputPath, JSON.stringify(manifestJson, null, 2))
  }
}

ExtraneousFileCleanupPlugin.prototype.apply = function (compiler) {
  if (compiler.hooks) {
    compiler.hooks.afterEmit.tap('ExtraneousFileCleanupPlugin', (compilation) => {
      this.afterEmit(compilation)
    })
  } else {
    compiler.plugin('after-emit', (compilation, callback) => {
      this.afterEmit(compilation)
      callback()
    })
  }
}

module.exports = ExtraneousFileCleanupPlugin
