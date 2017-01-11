const BasePage = require(appPath+'/ui/base/base-page.js')
const srvProduct = require(appPath+'/service/product.js')

class ProductDetailPage extends BasePage {
    prepare(){
        super.prepare()
        this._forceLoad = true
    }
    get btns(){
        return tfn.merge(super.btns, {onAddSpec: '.btn.add-spec'})
    }
    get $title(){
        return this._$title || (this._$title = this.$page.find('.panel-title'))
    }
    get paneBasic(){
        return this._paneBasic || (this._paneBasic = this.$subPane('Basic').data('page'))
    }
    get paneSpec(){
        return this._paneSpec || (this._paneSpec = this.$subPane('SpecModal').data('page'))
    }
    get paneSpecsInfo(){
        return this._paneSpecsInfo || (this._paneSpecsInfo = this.$subPane('SpecsInfo').data('page'))
    }
    get paneSpecsPrice(){
        return this._paneSpecsPrice || (this._paneSpecsPrice = this.$subPane('SpecsPrice').data('page'))
    }
    get paneSpecsPack(){
        return this._paneSpecsPack || (this._paneSpecsPack = this.$subPane('SpecsPack').data('page'))
    }
    get paneSpecsSupd(){
        return this._paneSpecsSupd || (this._paneSpecsSupd = this.$subPane('SpecsSupd').data('page'))
    }
    get $btnAddContact(){
        return this._$btnAddContact || (this._$btnAddContact = this.$page.find('.btn.add-contact'))
    }
    initEvents(){
        super.initEvents()
        this.$page.on('changed.spec.product', (e, spec) => {
            this.renderSpec(spec)
        })
        this.$page.on('open.spec.product', (e, specId) => {
            this.openSpec(specId)
        })
    }
    onShow(stub){
        super.onShow(stub)
        if (stub && stub._discard){
            this.$page.find('.for-discarded-hidden').addClass('hidden')
        }else{
            this.$page.find('.for-discarded-hidden').removeClass('hidden')
        }
    }
    onHide(){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return false
            this._modified = false
            this.render(this._data)
        }
        return true
    }
    onBack(){
        router.loadMainPanel('product')
    }
    onAddNew(){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return false
            this._modified = false
        }
        this.setStub({_id: ''})
        this.load()
    }
    doLoad(param){
        return srvProduct.loadById(param._id, param._discard).then(data => {
            data = data || {}
            if (param._discard){
                data._discard = param._discard
            }
            return data
        })
    }
    render(data){
        this.renderTitle(data)
        this.paneBasic && this.paneBasic.render(data)
        this.paneSpecsInfo && this.paneSpecsInfo.render(data&&data.specs)
        this.paneSpecsPrice && this.paneSpecsPrice.render(data&&data.specs)
        this.paneSpecsPack && this.paneSpecsPack.render(data&&data.specs)
        this.paneSpecsSupd && this.paneSpecsSupd.render(data&&data.specs)
        if (!data || !data._id){
            this.toEdit()
        }else{
            this.toRead()
        }
    }
    renderTitle(product){
        product = product || {}
        this.$title.find('.bind-product-name').text(product.name||'产品名称')
        this.$title.find('.bind-product-createdAt').text(tfn.fdate(product.createdAt||new Date()))
        // this.$title.find('.bind-product-creator').text(product.creator||'创建者')
        this.$title.find('.bind-product-contact-name').text(product.contacts && product.contacts[0].name||'主要供应商')
    }
    renderSpec(spec){
        // console.log(spec)
        this._data = this._data||{}
        let specs = this._data.specs = this._data.specs||[]
        let found = this.getSpecById(spec&&spec._id)
        if (found){
            tfn.merge(found, spec)
            delete found.code_bak
        }else{
            spec._id = srvProduct.newSpecId()
            specs.push(spec)
        }
        this.paneSpecsInfo.render(specs)
        this.paneSpecsPrice.render(specs)
        this.paneSpecsPack.render(specs)
    }
    checkPageData(){
        let specs =  this._data && this._data.specs || []
        if (!specs.length){
            tfn.tips('请先增加规格！', 'warning')
            this.openSpec('')
            return false
        }
        let valid = this.paneBasic.checkPageData()
        return valid
    }
    getPageData(){
        let data = this.paneBasic.getFormData()
        data = tfn.clone(this._data, data)
        if (data.tags){//标签s：字符串转为数组
            data.tags = data.tags.split(',').map(tag => $.trim(tag))
        }
        return data
    }
    doSave(data){
        if (this._param._discard){
            tfn.tips('不能修改已归档产品！', 'warning')
            return false
        }
        return srvProduct.save(data, this._param._discard).then(rst => {
            setTimeout(()=>router.$main.trigger('changed.product', [data]))
            return rst
        }).catch(err => {
            tfn.tips(err.message, 'danger')
            return Promise.reject(err)
        })
    }
    onAddSpec(){
        this.toEdit()
        this.openSpec('')
    }
    openSpec(specId){
        let opts = {id: 'productSpecDetailModal', append: true}
        this.$page.loadFile('ui/product/product-spec-detail.html', opts).then(() => {
            let $modal = this._$modal = this.$page.find('#'+opts.id)
            $modal.modal('show')
            let spec = this.getSpecById(specId)
            let pane = $modal.data('page')
            pane.render(spec)
        })
    }
    getSpecById(specId){
        this._data = this._data||{}
        let specs = this._data.specs = this._data.specs||[]
        for (let item of specs) {
            if (item._id === specId){
                return item
            }
        }
        return null
    }
    checkSpecCode(spec){//检查编码是否重复
        let specs = this._data && this._data.specs
        // if (!spec || !specs || !specs.length) return true
        for (let item of specs){
            if (item._id === spec._id) continue
            if (item.code === spec.code){
                return false
            }
        }
        let pdBasic = this.paneBasic.getFormData()
        if (pdBasic._id){
            pdBasic.specs = [spec]
            let p = srvProduct.checkPdSpecCodes(pdBasic)
            return p
        }
        return true
    }
}

module.exports = ProductDetailPage
