class BasePane { // base page pane(panel view in tabpanel)
    constructor({pid}){
        this._pid = '#'+pid //page identify
        this._stub = null //存根数据
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
        this.prepareEvents()
    }
    prepareEvents(){
        // on parent panel show...
        this.$navtab.on('show.bs.tab', (e)=>{
            let data = $(e.target).data('_spv')
            this.onShow(data)
        })
        this.$navtab.on('shown.bs.tab', (e)=>{
            let data = $(e.target).data('_spv')
            this.onShown(data)
        })
    }
    init(){ // do init on document ready
        this.load()
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
    onShow(data){//showing
        if (!Object.is(data, this._stub)){
            this.reload(data)
            this._stub = data
        }
    }
    onShown(data){//after show
    }
    load(){
        let p = this.doLoad()
        if (!(p instanceof Promise)) {
            this.onLoaded()
            return
        }
        p.catch(err => {
            console.log(err)
        }).finally(() => {
            this.onLoaded()
        })
    }
    reload(data){
        this.load()
    }
    doLoad(){
        // this.setFormData(data)
    }
    onLoaded(){
        // do sth. after doLoad()
    }
}

module.exports = BasePane
