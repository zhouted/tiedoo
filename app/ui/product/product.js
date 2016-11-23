const ListPage = require(appPath+'/ui/base/list-page.js')
const srvProduct = require(appPath+'/service/product.js')

class ProductPage extends ListPage{
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table.product-list'))
    }
    get $tplPd(){
        return this._$tplPd || (this._$tplPd = this.$table.find('#tplPd'))
    }
    get $tplSpec(){
        return this._$tplSpec || (this._$tplSpec = this.$table.find('#tplSpec'))
    }
    // get selectedPdIds(){
    //     let ids = []
    //     let $checks = this.$table.find('.product-item-basic>.field-check>input[type=checkbox]:checked')
    //     for (let check of $checks){
    //         let id = this.getItemId(check)
    //         id && ids.push(id)
    //     }
    //     return ids
    // }
    get selectedSpecIds(){
        let ids = []
        let $checks = this.$table.find('.product-item-spec>.field-check>input[type=checkbox]:checked')
        for (let check of $checks){
            let id = this.getItemId(check)
            id && ids.push(id)
        }
        return ids

    }
    // get selectedPds(){
    //     let pds = []
    //     let $pdChecks = this.$table.find('.product-item-basic>.field-check>input[type=checkbox]:checked')
    //     for (let pdCheck of $pdChecks){
    //         let pdId = this.getItemId(pdCheck)
    //         if (!pdId) continue
    //         let pd = {_id: pdId, specs: []}
    //         let $specChecks = $(pdCheck).closest('tbody').find('.product-item-spec>.field-check>input[type=checkbox]:checked')
    //         for (let specCheck of $specChecks){
    //             let specId = this.getItemId(specCheck)
    //             specId && pd.specs.push({_id: specId})
    //         }
    //         pds.push(pd)
    //     }
    // }
    getItemPdId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('.product-item')
        return $item.data('id')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onDiscard: '.btn.discard',
            onRestore: '.btn.restore',
            onToggleDiscarded: '.btn.toggle-discarded',
            onDetail: '.product-item>tr>td',
        })
    }
    showBtns(){
        if (this._discard){
        }
    }
    prepareEvents(){
        super.prepareEvents()
        router.$main.on('changed.product', (e, data) => {
            this.reload()
        })
    }
    get defaultParam(){
        return tfn.merge(super.defaultParam, {
            paging: {pageSize:10},
            discard: this._discard||false,
        })
    }
    onToggleDiscarded(){
        this._discard = !this._discard
        this.load().then(() => {
            if (this._discard){
                this.$page.find('.for-discarded-hidden').addClass('hidden')
                this.$page.find('.for-discarded').removeClass('hidden')
            }else{
                this.$page.find('.for-discarded').addClass('hidden')
                this.$page.find('.for-discarded-hidden').removeClass('hidden')
            }
        })
    }
    doLoad(param){
        return srvProduct.load(param)
    }
    render(data){
        this.$tplPd.siblings('tbody').remove()
        for (let pd of data) {
            let $item = $(tfn.template(this.$tplPd, pd))
            let specs = pd.specs
            if (specs){
                $item.append(tfn.template(this.$tplSpec, specs))
            }
            this.$tplPd.before($item)
        }
        this.loadImg()
    }
    loadImg(){
        this.$table.find('img[data-id]').each((i, img) => {
            let $img = $(img), imageId = $img.data('id')
            srvProduct.loadImg(imageId).then(file => {
                file && $img.attr('src', file.path)
            })
        })
    }
    doSearch(text){
        this.load({key: text})
    }
    toDetail(id){
        router.loadMainPanel('productDetail', {_id:id, _discard:this._discard})
    }
    onDetail(e, target){
        let id = this.getItemPdId(target)
        if (!id) return
        this.toDetail(id)
    }
    onAddNew(){
        this.toDetail()
    }
    onDiscard(){
        let ids = this.selectedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要归档的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认归档这${ids.length}个产品规格吗？`)){
            return
        }
        let p = srvProduct.discardSpecByIds(ids)
        p.then((rst) => {
            console.log(rst)
            this.reload()
        })
    }
    onRestore(){
        let ids = this.selectedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要还原的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认还原这${ids.length}个产品规格吗？`)){
            return
        }
        let p = srvProduct.restoreSpecByIds(ids)
        p.then((rst) => {
            console.log(rst)
            this.reload()
        })
    }
    onDelete(){
        let ids = this.selectedSpecIds
        if (!ids.length){
            tfn.tips('请先选择要删除的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认删除这个${ids.length}产品规格吗？`)){
            return
        }
        let p = srvProduct.removeSpecByIds(ids)
        p.then((rst) => {
            console.log(rst)
            this.reload()
        })
    }
}

module.exports = ProductPage
