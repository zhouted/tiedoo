const remoteUrls = require(appPath+'/config/remote-urls.js')
const {request} = require(appPath+'/service/remote/remote-fn.js')
const consts = require(appPath+'/apps/consts.js')

const filePath = app.getPath('userData')+'/Files/'

exports.loadImg = function(id){
    return new Promise((resolve, reject) => {
        let path = filePath + id
        let file = {path}
        if (fs.existsSync(path)){
            return resolve(file)
        }
        request({
            url: remoteUrls.downloadFile+id,
            dataType: 'text',
        }).then(data => {
            return fs.writeFileAsync(path, data).then(rst => {
                resolve(file)
            })
        }).catch(err => {
            console.log(err)
            reject(err)
        })
    })
}

exports.typeOfId = function(id){
    if (id){
        let pos = id.indexOf('_')
        if (pos > 0){
            return id.substr(0, pos)
        }
    }
    return ''
}
