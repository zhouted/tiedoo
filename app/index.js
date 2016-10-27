// Inject globals in the first html
window.electron = require('electron')
window.app = window.electron.remote.app
window.$ = window.jQuery = require('./ui/base/jquery/jquery.js')

// replace Promise with bluebird
Promise = require('bluebird');

// Inject plugins of jQuery
require('./ui/base/bootstrap/js/bootstrap.js')
require('./ui/base/jquery/jquery.include.js')
require('./ui/base/jquery/jquery.input.js')
require('./ui/base/jquery/jquery.input-img.js')
require('./ui/base/jquery/jquery.template.js')

// globals router for ui
const appPath = window.app.getAppPath()
const router = require('./ui/router.js')

router.gohome()
