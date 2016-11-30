require(appPath+'/ui/base/jquery/dropdown/typeahead.jquery.js')

class DdGrid{
    constructor(options, datasets){
        this.options = tfn.merge({}, options)
        this.datasets = datasets||[]
    }
    initOptions(){

    }
    initDatasets(){

    }
}

const plugins = DdGrid.plugins = {

}

$.fn.autoDdGrid = autoDdGrid
function autoDdGrid(ddType, options, ...datasets){
    let Base = plugins[ddType] || DdGrid
    let ddGrid = new Base(options, datasets)
    ddGrid.$ipt = this
    ddGrid.initOptions()
    ddGrid.initDatasets()
    return $.fn.typeahead.call(this, ddGrid.options, ...ddGrid.datasets)
}

module.exports = DdGrid
