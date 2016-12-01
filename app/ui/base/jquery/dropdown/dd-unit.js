const DdGrid = require(appPath+'/ui/base/jquery/dropdown/dd-grid.js')
const srvSetting = require(appPath+'/service/setting.js')

//Dropdown Untits
class DdUnit extends DdGrid{
    get defaultOpts(){
        return tfn.merge({}, super.defaultOpts, {
            // minList: 5,
            limit: 100,
            width: 160,
        })
    }
    get columns(){
        return [{name:'name', width:'40%'}, {name:'nameEn', width:'60%'}]
    }
    doMatch(query, syncb, asyncb){
        srvSetting.loadUnits(query).then(units => {
            // if (units && units.length > this.minList){
            //     this._caches = units
            // }else{//避免下拉项数太少
            //     this._caches = tfn.merge([], this._caches, this._units)
            // }
            asyncb(this._caches||units)
        })
    }
}

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
