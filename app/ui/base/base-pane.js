class BasePane { // base page pane(panel view in tabpanel)
    constructor({pid}){
        this._pid = '#'+pid //page identify
        this._stub = null //存根：上级(父窗口)传入的数据
        this._param = null //保存页面加载参数，以便刷新(reload)
        this._data = null //保存页面加载的数据
        this.prepare()
    }
    get pid(){// page id
        return this._pid
    }
    get $page(){// this page
        return this._$page || (this._$page = $(this._pid))
    }
    get $navtab(){// 导引进入页面的标签(anchor)
        return this._$navtab || (this._$navtab = $('a[href="#'+this.$tabpanel.attr('id')+'"]'))
    }
    get $tabpanel(){// 页面所在的tabpanel
        return this._$tabpanel || (this._$tabpanel = this.$page.parent().closest('.tab-pane'))
    }
    prepare(){ //do prepare on document loading(before init())
        this.$page.data('page', this)
        this.prepareEvents()
    }
    prepareEvents(){
        // on parent panel show...
        this.$navtab.on('show.bs.tab', (e)=>{
            let stub = $(e.target).data('_spv')
            this.onShow(stub)
        })
        this.$navtab.on('shown.bs.tab', (e)=>{
            this.onShown()
        })
    }
    setStub(stub){
        this.$navtab.data('_spv', stub)
        if (this._stub){
            this._stub = stub
        }
        if (this._param){
            tfn.merge(this._param, stub)
        }
    }
    init(){ // do init on document ready
        if (!this._param){
            this.load(this._stub)
        }
        this.initBtns()
    }
    get btns(){// buttons click handler map
        return {
            onAddNew: '.btn.add-new, .btn-add-new',
            onDelete: '.btn.delete, .btn-delete',
            onSearch: '.btn.search, .btn-search',
            onBack: '.btn.back, .btn-back',
        }
    }
    initBtns(){// bind buttons click handler
        let self = this
        for (let btn in this.btns){
            let cls = this.btns[btn]
            if (typeof(self[btn]) === 'function'){
                self.$page.off('click', cls).on('click', cls, function(e){
                    self[btn](e, this)
                })
            }
        }
    }
    onShow(stub = null){//showing
        if (!Object.is(stub, this._stub)){
            this._stub = stub
            this._param = this.defaultParam
            this.load()
        }
    }
    onShown(){//after show
    }
    get defaultParam(){
        return {}
    }
    load(exParam){
        let param = tfn.merge({}, this.defaultParam, this._stub, exParam)
        this._load(param)
    }
    reload(exParam){
        let param = tfn.merge(this._param, exParam)
        this._load(param)
    }
    _load(param){
        let p = this.doLoad(param)
        if (!(p instanceof Promise)) {
            this.onLoaded(param)
            return
        }
        p.catch(err => {
            console.log(err)
        }).finally(() => {
            this.onLoaded(param)
        })
    }
    doLoad(param){
        // this.setFormData(data)
    }
    onLoaded(param){
        this._param = param
        // do sth. after doLoad()
    }
}

module.exports = BasePane
