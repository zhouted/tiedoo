const BasePage = require(appPath+'/ui/base/base-page.js')
const srvProduct = require(appPath+'/service/product.js')

class ProductDetailPage extends BasePage {
    get btns(){
        return tfn.merge(super.btns, {onAddSpec: '.btn.add-spec'})
    }
    get $title(){
        return this._$title || (this._$title = this.$page.find('.panel-title'))
    }
    get paneBasic(){
        return this._paneBasic || (this._paneBasic = this.$page.find('#productDetailBasic').data('page'))
    }
    get paneSpec(){
        return this._paneSpec || (this._paneSpec = this.$page.find('#productDetailSpecModal').data('page'))
    }
    get paneSpecsInfo(){
        return this._paneSpecsInfo || (this._paneSpecsInfo = this.$page.find('#productSpecsInfo').data('page'))
    }
    get paneSpecsPrice(){
        return this._paneSpecsPrice || (this._paneSpecsPrice = this.$page.find('#productSpecsPrice').data('page'))
    }
    get paneSpecsPack(){
        return this._paneSpecsPack || (this._paneSpecsPack = this.$page.find('#productSpecsPack').data('page'))
    }
    get $btnAddContact(){
        return this._$btnAddContact || (this._$btnAddContact = this.$page.find('.btn.add-contact'))
    }
    prepareEvents(){
        this._forceLoad = true
        super.prepareEvents()
        this.$page.on('changed.spec.product', (e, spec) => {
            this.renderSpec(spec)
        })
        this.$page.on('open.spec.product', (e, specId) => {
            this.openSpec(specId)
        })
        // this.$btnAddContact.click(e => {
        //     this.paneContact.addNew()
        // })
        // this.$subtabs.on('shown.bs.tab', (e)=>{
        //     //显示联系人pane时才显示add-contact按钮
        //     if (e.target === this.paneContact.$navtab[0]){
        //         this.$btnAddContact.removeClass('hide')
        //         return
        //     }
        //     this.$btnAddContact.addClass('hide')
        // })
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
    onBack(e, btn){
        router.loadMainPanel('product')
    }
    doLoad(param){
        return srvProduct.loadById(param._id, param._discard)
    }
    render(data){
        this.renderTitle(data)
        this.paneBasic.render(data)
        this.paneSpecsInfo.render(data&&data.specs)
        this.paneSpecsPrice.render(data&&data.specs)
        this.paneSpecsPack.render(data&&data.specs)
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
        console.log(spec)
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
        let valid = this.paneBasic.checkPageData()
        if (valid && this._$modal){
            let specPane = this._$modal.data('page')
            valid = specPane.checkPageData()
            if (!valid){
                this._$modal.modal('show')
            }
        }
        return valid
    }
    getPageData(){
        let data = this.paneBasic.getFormData()
        data = tfn.merge({}, this._data, data)
        // let contacts = this.paneContact.getFormData()
        // let data = tfn.merge({}, info, {contacts})
        return data
    }
    doSave(data){
        if (!data || !data.specs || !data.specs.length){
            tfn.tips('请先增加规格！', 'warning')
            return this.openSpec('')
        }
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
}

module.exports = ProductDetailPage
