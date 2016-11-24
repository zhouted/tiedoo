class BasePane { // base page pane(panel view in tabpanel)
    constructor({pid}){
        this._pid = '#'+pid //page identify
        this._stub = null //存根：上级(父窗口)传入的数据
        this._param = null //保存页面加载参数，以便刷新(reload)
        this._data = null //保存页面加载的数据
        this._modified = false
        this._forceLoad = true
        this.prepare()
    }
    get pid(){// page id
        return this._pid
    }
    get $page(){// this page
        return this._$page || (this._$page = $(this._pid))
    }
    get $parentPage(){// parent page
        return this.$page.parent().closest('.ui-page')
    }
    get $navtab(){// 导引进入页面的标签(anchor)
        return this._$navtab || (this._$navtab = $('a[href="#'+this.$tabpanel.attr('id')+'"]'))
    }
    get $tabpanel(){// 页面所在的tabpanel
        return this._$tabpanel || (this._$tabpanel = this.$page.parent().closest('.tab-pane'))
    }
    get isEditing(){
        return this.$page.find('.for-editonly').is(':visible')
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
        // on parent panel hide...
        this.$navtab.on('hide.bs.tab', (e)=>{
            return this.onHide()
        })
        this.$navtab.on('hidden.bs.tab', (e)=>{
            this.onHidden()
        })

        // on changed
        this.$page.on('change', 'input[name], textarea[name]', (e) => {
            this._modified = true
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
        if (!this._param){// 加载之后_param就保存有加载参数
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
            onEdit: '.btn.edit, .btn-edit',
            onRead: '.btn.read, .btn-read',
            onSave: '.btn.save, .btn-save',
            onClose: '.btn.close, .btn-close',
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
        if (!tfn.equals(stub, this._stub) || this._forceLoad){
            this._stub = stub
            this._param = this.defaultParam
            this.load()
        }
    }
    onHide(){
        // if (this._modified){
        //     if (!window.confirm('确认取消修改？')) return false
        //     this.render(this._data)
        //     this._modified = false
        // }
        return true
    }
    onShown(){//after show
    }
    onHidden(){

    }
    get defaultParam(){
        return {}
    }
    load(exParam){
        let param = tfn.merge({}, this.defaultParam, this._stub, exParam)
        return this._load(param)
    }
    reload(exParam){
        let param = tfn.merge(this._param, exParam)
        return this._load(param)
    }
    _load(param){
        let p = this.doLoad(param)
        if (Object.is(p, undefined)) return
        if (!(p instanceof Promise)) {
            this.onLoaded({data:p, param})
            return Promise.resolve(p)
        }
        return p.then(data => {
            this.onLoaded({data})
            return data
        }).catch(err => {
            console.log(err)
        }).finally((data) => {
            this.onLoaded({param})
        })
    }
    doLoad(param){
        // this.setFormData(data)
    }
    render(data){
    }
    onLoaded({data, param}){
        // do sth. after doLoad()
        if (!Object.is(data, undefined)){
            this.render(data)
            this._data = data
        }
        if (!Object.is(param, undefined)){
            this._param = param
        }
    }
    checkPageData(){
        return this.$page.input('check')
    }
    getPageData(){ //get data to save
        return this.$page.input('values')
    }
    onSave(e, btn){
        let valid = this.checkPageData()
        if (!valid){
            return
        }
        $(btn).button('loading')
        let data = this.getPageData()
        let p = this.doSave(data)
        if (!(p instanceof Promise)) {
            this.rerender(data, p)
            this.onSaved(e, btn)
            return
        }
        p.then(rst => {
            console.log(rst)
            this.rerender(data, rst)
            this.toRead()
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            this.onSaved(e, btn)
        })
    }
    rerender(data, saved){
        if (data && saved && saved._id){
            this.setStub({_id: saved._id})
            tfn.merge(data, saved)
        }
        this.render(data)
        this._data = data
    }
    doSave(data){
        // return srvXXX.save(data)
    }
    onSaved(e, btn){
        $(btn).button('reset')
    }
    onEdit(e, btn){
        this.toEdit()
    }
    toEdit(){
        this.$page.input('edit')
    }
    onRead(e, btn){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return
            this.render(this._data)
        }
        this.toRead()
    }
    toRead(){
        this._modified = false
        this.$page.input('read')
    }
}

module.exports = BasePane
