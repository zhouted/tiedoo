const remoteUrls = require(appPath+'/config/remote-urls.js')
const remoteFn = require(appPath+'/service/remote/remote-fn.js')

const remoteSetting = {}

remoteSetting.getAllTags = function(token){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.getAllTags, {token}).then(data => {
            let tags = toLocalTags(data&&data.tags)
            resolve(tags)
        }).catch(err => {
            reject(err)
        })
    })
}
function toLocalTags(data){
    let tags = []
    for (let item of data){
        if (item && item.name)
        tags.push(item.name)
    }
    return tags
}

remoteSetting.getAllUnits = function(token){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.getAllUnits, {token}).then(data => {
            let units = toLocalUnits(data)
            resolve(units)
        }).catch(err => {
            reject(err)
        })
    })
}
remoteSetting.getAllPackUnits = function(token){
    return new Promise((resolve, reject) => {
        remoteFn.request(remoteUrls.getAllPackUnits, {token}).then(data => {
            let units = toLocalUnits(data)
            resolve(units)
        }).catch(err => {
            reject(err)
        })
    })
}
function toLocalUnits(data){
    let units = []
    for (let item of data){
        let unit = {
            id: item.id,
            name: item.chsName,
            nameEn: item.enName,
        }
        units.push(unit)
    }
    return units
}


module.exports = remoteSetting
