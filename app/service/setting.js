const daoSetting = require(appPath + '/dao/setting.js')
const remoteSetting = require(appPath + '/service/remote/setting.js')

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
    return p
}
srvSetting.saveTags = function(tags){
    return daoSetting.update({type: srvSetting.TYPE_TAGS}, {$set: {values: tags}}, {upsert: true})
}
srvSetting.downloadTags = function(token, cb){
    return new Promise((resolve, reject) => {
        remoteSetting.getAllTags(token).then(tags => {
            return daoSetting.findOne({type: srvSetting.TYPE_TAGS}).then(doc => {
                cb && cb('tags')
                let mergedTags = mergeTags(doc&&doc.values, tags)
                return srvSetting.saveTags(mergedTags).then(rst => {
                    resolve(rst)
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
    function mergeTags(existTags, tags){
        existTags = existTags||[]
        for (let tag of tags){
            existTags.popush(tag)
        }
        return existTags
    }
}

srvSetting.TYPE_UNIT = 'unit' //预置计量单位
srvSetting.defaultUnits = require(appPath+'/config/default-units.js').units
srvSetting.loadUnits = function(key){
    let p = daoSetting.findOne({type: srvSetting.TYPE_UNIT}).then(doc => {
        let units = doc && doc.values
        if (!units || !units.length){
            units = srvSetting.defaultUnits
        }
        if (key){
            let rgKey = new RegExp(key,'i')
            let filtered = units.filter(unit => (unit.name+unit.nameEn).match(rgKey))
            if (filtered && filtered.length){
                units = filtered
            }
        }
        return units
    })
    return p
}
srvSetting.saveUnits = function(units){
    return daoSetting.update({type: srvSetting.TYPE_UNIT}, {$set: {values: units}}, {upsert: true})
}
srvSetting.downloadUnits = function(token, cb){
    return new Promise((resolve, reject) => {
        remoteSetting.getAllUnits(token).then(units => {
            return daoSetting.findOne({type: srvSetting.TYPE_UNIT}).then(doc => {
                cb && cb('units')
                let mergedUnits = mergeUnits(doc&&doc.values, units)
                return srvSetting.saveUnits(mergedUnits).then(rst => {
                    resolve(rst)
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
}
function mergeUnits(existUnits, units){
    existUnits = existUnits||[]
    for (let unit of units){
        let exist = existUnits.itemOf({name:unit.name, nameEn:unit.nameEn})
        if (exist){
            tfn.merge(exist, unit)
        }else{
            existUnits.push(unit)
        }
    }
    return existUnits
}

srvSetting.TYPE_PACKUNIT = 'packUnit' //预置包装单位
srvSetting.defaultPackUnits = require(appPath+'/config/default-units.js').packUnits
srvSetting.loadPackUnits = function(key){
    let p = daoSetting.findOne({type: srvSetting.TYPE_PACKUNIT}).then(doc => {
        let units = doc && doc.values
        if (!units || !units.length){
            units = srvSetting.defaultPackUnits
        }
        if (key){
            let rgKey = new RegExp(key,'i')
            let filtered = units.filter(unit => (unit.name+unit.nameEn).match(rgKey))
            if (filtered && filtered.length){
                units = filtered
            }
        }
        return units
    })
    return p
}
srvSetting.savePackUnits = function(units){
    return daoSetting.update({type: srvSetting.TYPE_PACKUNIT}, {$set: {values: units}}, {upsert: true})
}
srvSetting.downloadPackUnits = function(token, cb){
    return new Promise((resolve, reject) => {
        remoteSetting.getAllPackUnits(token).then(units => {
            return daoSetting.findOne({type: srvSetting.TYPE_PACKUNIT}).then(doc => {
                cb && cb('pack-units')
                let mergedUnits = mergeUnits(doc&&doc.values, units)
                return srvSetting.savePackUnits(mergedUnits).then(rst => {
                    resolve(rst)
                })
            })
        }).catch(err => {
            reject(err)
        })
    })
}

srvSetting.load = function(type){
    return daoSetting.find({type})
}

srvSetting.save = function(doc){
    return daoSetting.save(doc)
}

module.exports = srvSetting
