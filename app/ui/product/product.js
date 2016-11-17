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
    get selectedPdIds(){
        let ids = []
        let $checks = this.$table.find('input[type=checkbox]:checked')
        for (let check of $checks){
            let id = this.getItemPdId(check)
            id && ids.push(id)
        }
        return ids
    }
    getItemPdId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('.product-item')
        return $item.data('id')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onDetail: '.product-item>tr>td',
        })
    }
    prepareEvents(){
        super.prepareEvents()
        router.$main.on('changed.product', (e, data) => {
            this.reload()
        })
    }
    get defaultParam(){
        return tfn.merge(super.defaultParam, {paging:{pageSize:10}})
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
        router.loadMainPanel('productDetailPanel', {_id:id})
    }
    onDetail(e, target){
        let id = this.getItemPdId(target)
        if (!id) return
        this.toDetail(id)
    }
    onAddNew(){
        this.toDetail()
    }
    onDelete(){
        let ids = this.selectedIds
        if (!ids.length){
            tfn.tips('请先选择要删除的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认删除这个${ids.length}客户吗？`)){
            return
        }
        let p = ids.map(id => srvProduct.delete({_id: id}))
        Promise.all(p).then(() => {
            this.reload()
        })
    }
}

module.exports = ProductPage
