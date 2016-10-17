// Inject globals in the first html
window.electron = require('electron')
window.app = window.electron.remote.app
window.$ = window.jQuery = require('./base/libs/jquery/jquery.js')

// replace Promise with bluebird
Promise = require('bluebird');

// Inject plugins of jQuery
require('./base/libs/bootstrap/js/bootstrap.js')
require('./base/libs/jquery/jquery.include.js')
require('./base/libs/jquery/jquery.input.js')
require('./base/libs/jquery/jquery.template.js')

// globals router for ui
const appPath = window.app.getAppPath()
const router = require('./ui/router.js')

router.gohome()
