const {app, BrowserWindow} = require('electron')

let browser = null,
    appPath = app.getAppPath()

// open main browser window
function open(){
    if (!browser){
        browser = new BrowserWindow({show: false})
    }
    browser.loadURL(`file://${appPath}/index.html`)
    browser.maximize()
    browser.openDevTools()
    browser.on('close', ()=>{
        browser = null
    })
}

function show(){
    browser && browser.focus()
}

module.exports = {open, show}
