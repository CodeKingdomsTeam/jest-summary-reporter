const { white } = require('./BashColorUtils');

const regexPathSeparator = require('path').sep === '/' ? '/' : '\\\\';

function processFullPath(fullPath) {
  let pathSeparationPattern = new RegExp(`^(.+)(test${regexPathSeparator}.+${regexPathSeparator})(.+)$`);
  let pathSeparationResult = fullPath.match(pathSeparationPattern);
  //Can happen if there is no `test` folder on the path
  if (!pathSeparationResult) {
    return path({
      path: "",
      file: slash(fullPath.match(new RegExp(`(.+${regexPathSeparator})(.+)$`))[2])
    })
  } else {
    return path({
      path: slash(pathSeparationResult[2]),
      file: slash(pathSeparationResult[3])
    })
  }
}

function path({path, file}) {
  return {
    path,
    file,
    toString() {
      return this.path + white(this.file);
    }
  }
}

function slash(s) {
  return s.replace(/\\/g, "/")
}

module.exports = {
  processFullPath
};