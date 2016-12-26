const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')
const consts = require(appPath+'/apps/consts.js')

const filePath = app.getPath('userData')+'/Files/'
mkdir(filePath) //预建Files文件夹

exports.loadImg = function(id){//获取远端文件并保存到本地
    return new Promise((resolve, reject) => {
        let path = filePath + id
        let file = {path}
        if (fs.existsSync(path)){//已缓存到本地
            return resolve(file)
        }
        let url = remoteUrls.downloadFile+id
        remoteFn.loadFile(url).then(data => {
            let buf = Buffer.from(new Uint8Array(data))//http://stackoverflow.com/questions/39395195/how-to-write-wav-file-from-blob-in-javascript-node
            return fs.writeFileAsync(path, buf).then(rst => {
                resolve(file)
            })
        }).catch(err => {
            console.log(err)
            reject(err)
        })
    })
}

exports.typeOfId = function(id){//根据id前缀判断其类型
    if (id){
        let pos = id.indexOf('_')
        if (pos > 0){
            return id.substr(0, pos)
        }
    }
    return ''//非云端id
}
