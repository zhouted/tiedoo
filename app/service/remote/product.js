const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')

const remotePd = {}

remotePd.getPdVersions = function(token){
    let state = JSON.stringify(['f1', 'f3'])
    return remoteFn.request(remoteUrls.getPdVersions, {token, state})
}

remotePd.getPdByIds = function(ids, token){
    let data = JSON.stringify(ids)
    return remoteFn.request(remoteUrls.getPdByIds, {token, data})
}

module.exports = remotePd
