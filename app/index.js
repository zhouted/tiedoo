// Inject globals in the first html
window.electron = require('electron')
window.app = window.electron.remote.app
window.$ = window.jQuery = require('./ui/base/jquery/jquery.js')
window.tfn = require('./apps/tfn.js')

// global const vars:
window.appPath = window.app.getAppPath()
// replace Promise with bluebird
window.Promise = require('bluebird');
// Promisify fs && mkdir
window.fs = require('fs')
window.path = require('path')
let mkdirp = require('mkdirp')
Promise.promisifyAll(fs)
window.mkdir = Promise.promisify(mkdirp)

// Inject plugins of jQuery
require('./ui/base/bootstrap/js/bootstrap.js')
require('./ui/base/jquery/jquery.include.js')
require('./ui/base/jquery/jquery.input.js')
require('./ui/base/jquery/jquery.input-img.js')
require('./ui/base/jquery/jquery.spv.js')
require('./ui/base/jquery/jquery.transports.js')
window.tfn.template = require('./ui/base/jquery/jquery.template.js')

// global router for ui
window.router = require('./ui/router.js')
router.gohome()//let's go!
