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
    get $btnAddContact(){
        return this._$btnAddContact || (this._$btnAddContact = this.$page.find('.btn.add-contact'))
    }
    prepareEvents(){
        this._forceLoad = true
        super.prepareEvents()
        this.$page.on('changed.spec.product', (e, spec) => {
            this.renderSpec(spec)
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
    onHide(){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return false
            this._modified = false
            this.render(this._data)
        }
        return true
    }
    onBack(e, btn){
        router.loadMainPanel('productPanel')
    }
    doLoad(param){
        return srvProduct.loadById(param._id)
    }
    render(data){
        this.renderTitle(data)
        this.paneBasic.render(data)
        this.paneSpecsInfo.render(data&&data.specs)
        if (!data || !data._id){
            this.toEdit()
        }else{
            this.toRead()
        }
        this.$subtabs.first().tab('show')
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
        specs.push(spec)
        this.paneSpecsInfo.render(specs)
    }
    getPageData(){
        let data = this.paneBasic.getFormData()
        // let contacts = this.paneContact.getFormData()
        // let data = tfn.merge({}, info, {contacts})
        return data
    }
    doSave(data){
        return srvProduct.save(data).then(rst => {
            setTimeout(()=>router.$main.trigger('changed.product', [data]))
            return rst
        })
    }
    onAddSpec(){
        let opts = {id: 'productDetailSpecModal', append: true}
        this.$page.loadFile('ui/product/product-detail-spec.html', opts).then(() => {
            let $modal = $('#'+opts.id)
            $modal.modal('show')
        })
    }
}

module.exports = ProductDetailPage
