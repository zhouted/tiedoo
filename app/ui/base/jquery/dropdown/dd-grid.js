require(appPath+'/ui/base/jquery/dropdown/typeahead.jquery.js')

class DdGrid{
    constructor(options, datasets){
        this.options = tfn.merge({}, options)
        this.datasets = tfn.merge([], datasets)
    }
    initOptions(){

    }
    initDatasets(){

    }
}

const plugins = DdGrid.plugins = {

}

$.fn.autoDdGrid = function(options, ...datasets){
    for (let ipt of this){
        autoDdGrid(ipt, options, datasets)
    }
    return this
}

function autoDdGrid(ipt, options, datasets){
    let $ipt = $(ipt)
    let ddType = $ipt.data('ddType')||'DdGrid'
    let Base = plugins[ddType] || DdGrid
    let ddGrid = new Base(options, datasets)
    ddGrid.$ipt = $ipt
    ddGrid.initOptions()
    ddGrid.initDatasets()
    console.log(ddGrid)
    return $.fn.typeahead.call($ipt, ddGrid.options, ...ddGrid.datasets)
}

module.exports = DdGrid
