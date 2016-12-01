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
    return p
}
srvSetting.saveTags = function(tags){
    return daoSetting.update({type: srvSetting.TYPE_TAGS}, {$set: {values: tags}}, {upsert: true})
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
            let reg = new RegExp(key,'i')
            units = units.filter(unit => (unit.name+unit.nameEn).match(reg))
        }
        return units
    })
    return p
}
srvSetting.saveUnits = function(units){
    return daoSetting.update({type: srvSetting.TYPE_UNIT}, {$set: {values: units}}, {upsert: true})
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
            let reg = new RegExp(key,'i')
            units = units.filter(unit => (unit.name+unit.nameEn).match(reg))
        }
        return units
    })
    return p
}
srvSetting.savePackUnits = function(units){
    return daoSetting.update({type: srvSetting.TYPE_PACKUNIT}, {$set: {values: units}}, {upsert: true})
}


srvSetting.load = function(type){
    return daoSetting.find({type})
}

srvSetting.save = function(doc){
    return daoSetting.save(doc)
}

module.exports = srvSetting
