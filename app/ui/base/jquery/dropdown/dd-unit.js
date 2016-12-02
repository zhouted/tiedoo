const DdGrid = require(appPath+'/ui/base/jquery/dropdown/dd-grid.js')
const srvSetting = require(appPath+'/service/setting.js')

//Dropdown Units: 计量单位
class DdUnit extends DdGrid{
    get defaultOpts(){
        return tfn.merge({}, super.defaultOpts, {
            limit: 100,
            width: 160,
        })
    }
    get columns(){
        return [{name:'name', width:'40%'}, {name:'nameEn', width:'60%'}]
    }
    doMatch(query, syncb, asyncb){
        srvSetting.loadUnits(query).then(units => {
            asyncb(units)
        })
    }
}

//Dropdown Pack Units: 包装单位
class DdPackUnit extends DdUnit{
    doMatch(query, syncb, asyncb){
        srvSetting.loadPackUnits(query).then(units => {
            asyncb(units)
        })
    }
}

DdGrid.types.DdUnit = DdUnit
DdGrid.types.DdPackUnit = DdPackUnit
module.exports = DdUnit
