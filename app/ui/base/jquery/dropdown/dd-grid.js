require(appPath+'/ui/base/jquery/dropdown/typeahead.jquery.js')

//class: Dropdown Grid
class DdGrid{
    get defaultOpts(){
        return {
            highlight: true,
            hint: true,
            minLength: 0,
            minList: 1,
            limit: 5,
            width: 200,
        }
    }
    constructor(options, datasets){
        this.options = tfn.merge(this.defaultOpts, options)
        for (let prop of ['minList', 'limit', 'width']){
            if (typeof(this.options[prop])!=='undefined'){
                this[prop] = this.options[prop]
                delete this.options[prop]
            }
        }
        this.datasets = tfn.merge([], datasets)
    }
    set $ipt($ipt){// 关联的输入框
        if (!$ipt) return
        if (!($ipt instanceof jQuery)){
            $ipt = $($ipt)
        }
        if ($ipt && $ipt.length){
            this._$ipt = $ipt
        }
    }
    get $ipt(){
        return this._$ipt
    }
    get value(){//输入框当前值
        return this.$ipt.val()
    }
    get name(){//输入框名称
        if (this._name) return this._name
        if (this.$ipt){
            this._name = this.$ipt.attr('name')
        }
        return this._name||'name'
    }
    get key(){// display key
        if (this._key) return this._key
        if (this.$ipt){
            this._key = this.$ipt.data('ddKey')||this.$ipt.attr('name')
        }
        return this._key||'key'
    }
    get columns(){//dropdown grid columns
        return []//[{name:'code', width:'20%'}, {name:'name', width:'80%'}]
    }
    initOptions(){
    }
    initDatasets(){
        this.datasets.push({
            name: this.name,
            display: this.key,
            limit: this.limit||0,
            source: (query, syncb, asyncb) => {
                syncb(['_dummy_']) //必须先有同步数据???
                this.doMatch(query, syncb, asyncb)
            },
            templates:{
                suggestion: (suggestion) => this.renderSuggestion(suggestion),
            }
        })
    }
    doMatch(query, syncb, asyncb){
    }
    renderSuggestion(suggestion){//拼成表格
        let active = (suggestion[this.key]==this.value)&&this.value&&'active'//激活和当前值一致的行
        if (suggestion == '_dummy_') active = 'hidden'//隐藏dummy
        let cols = this.columns
        let table = '<div class="'+active+'" style="width:'+tfn.fnum(this.width)+'px;"><table><tr>'
        for (let col of cols){
            let name = col.name
            let width = col.width
            table += '<td width="'+tfn.fnum(width)+'%">'+tfn.fstr(suggestion[name])+'</td>'
        }
        table += '</tr></table></div>'
        return table
    }
}

//ddTypes:
const types = DdGrid.types = {}

//jquery plugin's method:
$.fn.autoDdGrid = function(options, ...datasets){
    let method
    if (typeof(options) == 'string'){
        method = options
        options = datasets[0]
    }
    switch (method) {
    case 'val':
        return this.typeahead('val', options)
    case 'refresh':
        for (let ipt of this) {
            $(ipt).typeahead('val', ipt.value)
        }
        break
    default:
        for (let ipt of this) {
            initDdGrid(ipt, options, datasets)
        }
    }
    return this
}

function initDdGrid(ipt, options, datasets){
    let $ipt = $(ipt)
    let ddType = $ipt.data('ddType')||'DdGrid'
    let Base = types[ddType] || DdGrid
    let ddGrid = new Base(options, datasets)
    ddGrid.$ipt = $ipt
    ddGrid.initOptions()
    ddGrid.initDatasets()
    $ipt.typeahead(ddGrid.options, ...ddGrid.datasets)
    if (typeof(ddGrid.onSelect) == 'function'){
        $ipt.on('typeahead:select', (e, suggestion) => ddGrid.onSelect(e, suggestion))
    }
}

module.exports = DdGrid
