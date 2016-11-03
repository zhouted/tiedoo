class BasePage {
    constructor({pid}){
        this._pid = '#'+pid
        this.prepare()
    }
    get pid(){
        return this._pid
    }
    get $page(){
        return this._$page || (this._$page = $(this._pid))
    }
    get $parent(){
        return this._$parent || (this._$parent = this.$page.parent().closest('.tab-pane'))
    }
    get $subtabs(){
        return this._$subtabs || (this._$subtabs = $(this.$page.find('.nav-tabs>li>a[role=tab]')))
    }
    get $spvtab(){
        if (this._$spvtab) return this._$spvtab
        let panelId = this.$parent.attr('id')
        return (this._$spvtab = $('a[href="#'+panelId+'"]'))
    }
    prepare(){ //do prepare on document loading(before init())
        // on parent panel showing...
        this.$spvtab.on('show.bs.tab', (e)=>{
            let data = $(e.target).data('_spv')
            this.onShow(data)
        })
    }
    init(){ // do init on document ready
        this.load()
        this.initBtns()
    }
    get btns(){
        return {
            onAddNew: '.btn.add-new',
            onDelete: '.btn.delete',
            onSearch: '.btn.search',
            onBack: '.btn.back',
        }
    }
    initBtns(){
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
        data && this.reload(data)
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
