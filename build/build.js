const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const version = require('../package.json').version
const babel = require('rollup-plugin-babel')
const rollResolve = require('rollup-plugin-node-resolve')
const uglify = require('uglify-js')
const zlib = require('zlib')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

function resolve(p) {
  return path.resolve(__dirname, '../', p)
}

const banner =
  '/*!\n' +
  ' * simple-login v' + version + '\n' +
  ' * (c) 2018-' + new Date().getFullYear() + ' joe.zhou\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const gopts = {
  
}

const builds = [{
  input: resolve('src/index.js'),
  output: {
    name: 'SimpleLogin',
    format: 'umd',
    file: resolve('dist/simple-login.js'),
    banner
  },
  plugins: [
    rollResolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  external: ['qs', 'md5', 'jsencrypt']
}, {
  input: resolve('src/index.js'),
  output: {
    file: resolve('dist/simple-login.esm.js'),
    format: 'es',
    name: 'SimpleLogin',
    banner
  },
  plugins: [
    rollResolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  external: ['qs', 'md5', 'jsencrypt']
}, {
  input: resolve('src/index.js'),
  output: {
    file: resolve('dist/simple-login.min.js'),
    format: 'umd',
    name: 'SimpleLogin',
    banner
  },
  plugins: [
    rollResolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
  ],
  external: ['qs', 'md5', 'jsencrypt']
}]

function build(builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry(config) {
  const isProd = /min\.js$/.test(config.output.file)
  return rollup.rollup(config).then(async (bundle) => {
    const { code } = await bundle.generate(config)
    if (isProd) {
      var minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
        output: {
          ascii_only: true
        },
        compress: {
          pure_funcs: ['makeMap']
        }
      }).code
      return write(config.output.file, minified, true)
    } else {
      return write(config.output.file, code)
    }
  }).catch(logError)
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, (err) => {
      if (err) {
        return reject(err)
      }
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function logError(e) {
  console.log(e)
}

build(builds)