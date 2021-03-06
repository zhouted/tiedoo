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
        return tfn.clone(super.btns, {
            onDetail: '.category-item>td',
        })
    }
    initEvents(){
        super.initEvents()
        router.$main.on('changed.category', (e, cate) => {
            this.reload().then(() => {
                cate && this.$table.treetable('reveal', cate.code)
            })
        })
    }
    doLoad(param){
        return srvCategory.load(param)
    }
    doSearch(text){
        return this.load({key: text})
        // let $items = this.$table.find('.category-item')
        // for (let item of $items){
        //     let $item = $(item)
        //     let code = $item.data('code')
        //     if (code && code.match(text)){
        //         this.$table.treetable('reveal', code)
        //     }
        // }
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
            expanderTemplate: '<a href="#"><span class="glyphicon"></span></a>',
            stringExpand: "展开",
            stringCollapse: "收起",
        }, true)
    }
    onDetail(e, target){
        let id = this.getItemId(target)
        if (!id) return
        this.toDetail(id)
    }
    onAddNew(e, btn){
        let cate = this.getItemData(btn)
        this.toDetail('', cate&&cate.code||'')
    }
    toDetail(id, pcode){
        let opts = {id: 'categoryDetailModal', append: true}
        this.$page.loadFile('ui/category/category-detail.html', opts).then(() => {
            let $modal = $('#'+opts.id)
            $modal.data('_spv', {_id: id, pcode}).modal('show')
        })
    }
    onDelete(e, btn){
        let cate = this.getItemData(btn)
        if (!cate) return
        if (!this.$itemOf(btn).is('.leaf')){
            tfn.tips('请先删除下级品类！')
            return
        }
        if (!window.confirm(`确认删除品类"${cate.code||''}-${cate.name||''}"吗？`)){
            return
        }
        srvCategory.removeOf(cate).then(() => {
            this.reload().then(() => {
                cate.pcode && this.$table.treetable('reveal', cate.pcode)
            })
            router.$main.trigger('changed.category', [cate])
        })
    }
    onBack(){
        router.loadMainPanel('product')
    }
}

module.exports = CategoryPage
