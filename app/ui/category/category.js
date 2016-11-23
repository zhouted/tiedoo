const ListPage = require(appPath+'/ui/base/list-page.js')
const srvCategory = require(appPath+'/service/category.js')

class CategoryPage extends ListPage {
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table'))
    }
    get $tplTr(){
        return this._$tplTr || (this._$tplTr = this.$table.find('#tplTr'))
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onDetail: '.category-item>td',
        })
    }
    prepareEvents(){
        super.prepareEvents()
        this.$page.on('changed.category', (e, data) => {
            this.reload()
        })
    }
    doLoad(param){
        return srvCategory.load(param)
    }
    render(data){
        this.$tplTr.siblings().remove()
        this.$tplTr.renderTpl(data)
        this.$table.treetable({
            indent: 0,
            columnElType: 'th',
            nodeIdAttr: 'code',
            parentIdAttr: 'pcode',
            expandable: true,
            clickableNodeNames: true,
        }, true)
    }
    onDetail(e, target){
        let id = this.getItemId(target)
        if (!id) return
        this.toDetail(id)
    }
    onAddNew(e, btn){
        let $item = $(btn).closest('.category-item')
        if (!$item || !$item.length){
            this.toDetail('')
        }else{
            let pcode = $item.find('.field-code').text()
            this.toDetail('', pcode)
        }
    }
    toDetail(id, pcode){
        let opts = {id: 'categoryDetailModal', append: true}
        this.$page.loadFile('ui/category/category-detail.html', opts).then(() => {
            let $modal = $('#'+opts.id)
            $modal.data('_spv', {_id: id, pcode}).modal('show')
        })
    }
}

module.exports = CategoryPage
