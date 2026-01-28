const path = require('path')

const rootDir = path.resolve(__dirname, '..')

const resolvePackageJson = function (moduleName, baseDir) {
  return require.resolve(`${moduleName}/package.json`, { paths: [baseDir] })
}

const getVersion = function (cdnModule) {
  let baseDir = rootDir
  cdnModule.dependedBy.forEach(function (dep) {
    const depPackageJson = resolvePackageJson(dep, baseDir)
    baseDir = path.dirname(depPackageJson)
  })
  const packageJson = resolvePackageJson(cdnModule.moduleName, baseDir)
  return require(packageJson).version
}

const buildScriptURL = function (cdnModule) {
  const version = getVersion(cdnModule)
  return `https://cdnjs.cloudflare.com/ajax/libs/${cdnModule.libraryName}/${version}/${cdnModule.scriptPath}`
}

const buildCSSURL = function (cdnModule) {
  const version = getVersion(cdnModule)
  return `https://cdnjs.cloudflare.com/ajax/libs/${cdnModule.libraryName}/${version}/${cdnModule.cssPath}`
}

module.exports = {buildScriptURL, buildCSSURL}
