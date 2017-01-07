// This is the main process, started as first thing when your
// app starts. This script is running through entire life of your application.
const {app} = require('electron')
const window = require('./apps/window.js');

// makeSingleInstance
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    window.show();
})
if (shouldQuit) {
    app.quit()
}

// open browser window on app ready
app.on('ready', window.open)
app.on('activate', window.open)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
