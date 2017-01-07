const UnitForm = require(appPath+'/ui/setting/setting-unit.js')
const srvSetting = require(appPath+'/service/setting.js')

// const MAX_UNITS = 120 //最大标数量
class PackUnitForm extends UnitForm{
    doLoad(){
        return srvSetting.loadPackUnits()
    }
    doSave(units){
        return srvSetting.savePackUnits(units).then(() => {
            tfn.tips('保存成功！')
            // router.$main.trigger('changed.setting.units', [units])
            return units
        })
    }
}

module.exports = PackUnitForm
