const daoSetting = require(appPath + '/dao/setting.js')

let srvSetting = {}

srvSetting.TYPE_TAGS = 'tags' //预置标签
srvSetting.defaultTags = require(appPath+'/config/default-tags.js')
srvSetting.loadTags = function(){
    let p = daoSetting.findOne({type: srvSetting.TYPE_TAGS}).then(doc => {
        let tags = doc && doc.values
        if (!tags || !tags.length){
            tags = srvSetting.defaultTags
        }
        return tags
    })
    // let p = new Promise((resolve, reject) => {
    //     let p = daoSetting.findOne({type: srvSetting.TYPE_TAGS})
    //     p.then(doc => {
    //         let tags = doc && doc.values
    //         if (!tags || !tags.length){
    //             tags = srvSetting.defaultTags
    //         }
    //         resolve(tags)
    //     }).catch(err => reject(err))
    // })
    return p
}
srvSetting.saveTags = function(tags){
    return daoSetting.update({type: srvSetting.TYPE_TAGS}, {$set: {values: tags}}, {upsert: true})
}


srvSetting.load = function(type){
    return daoSetting.findOne({type})
}

srvSetting.save = function(doc){
    return daoSetting.save(doc)
}

module.exports = srvSetting
