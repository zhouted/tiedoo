class BasePage {
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
    get $tabpanel(){// 页面上级tabpanel
        return this._$tabpanel || (this._$tabpanel = this.$page.parent().closest('.tab-pane'))
    }
    get $subtabs(){// 页面内的子nav-tabs
        return this._$subtabs || (this._$subtabs = $(this.$page.find('.nav-tabs>li>a[role=tab]')))
    }
    get $navtab(){// 导引页面的标签(anchor)
        return this._$navtab || (this._$navtab = $('a[href="#'+this.$tabpanel.attr('id')+'"]'))
    }
    prepare(){ //do prepare on document loading(before init())
        this.prepareEvents()
    }
    prepareEvents(){
        // on parent panel showing...
        this.$navtab.on('show.bs.tab', (e)=>{
            let data = $(e.target).data('_spv')
            this.onShow(data)
        })
    }
    init(){ // do init on document ready
        this.load()
        this.initBtns()
    }
    get btns(){// buttons click handler map
        return {
            onAddNew: '.btn.add-new',
            onDelete: '.btn.delete',
            onSearch: '.btn.search',
            onBack: '.btn.back',
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
    onShow(data){
        if (!Object.is(data, this._stub)){
            this.reload(data)
            this._stub = data
        }
        if (this.$subtabs.length){
            this.doSubtabs(data)
        }
    }
    doSubtabs(data){
        let tab = this.$subtabs.filter('[aria-expanded=true]')
        if (!tab.length){
            tab = this.$subtabs.first()
        }
        let panel = $(tab.attr('href')).removeClass('active')
        tab.parent().removeClass('active')
        this.$subtabs.data('_spv', data)
        tab.tab('show')
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

module.exports = BasePage
