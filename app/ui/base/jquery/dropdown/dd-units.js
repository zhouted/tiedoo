const DdGrid = require(appPath+'/ui/base/jquery/dropdown/dd-grid.js')

class DdUnits extends DdGrid{
    get display(){
        if (this._display) return this._display
        if (this.$ipt){
            this._display = this.$ipt.data('ddDisplay')
        }
        return this._display || (this._display = 'name')
    }
    initDatasets(){
        this.datasets.push({
            name: 'ds-units',
            display: this.display,
            source: (...args) => this.doMatch(...args),
            templates:{
                suggestion: (...args) => this.doRender(...args),
            }
        })
    }
    doMatch(query, syncb, asyncb){
        syncb([{name: '啊', nameEn: 'a'}, {name: '吧', nameEn: 'b'}, {name: '擦', nameEn: 'c'}])
    }
    doRender(data){
        return `<div><table><tr><td>${tfn.fstr(data.name)}</td><td>${tfn.fstr(data.nameEn)}</td></tr></table></div>`
    }
}

DdGrid.plugins.DdUnits = DdUnits
module.exports = DdUnits
