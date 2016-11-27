const ListPage = require(appPath+'/ui/base/list-page.js')
const srvProduct = require(appPath+'/service/product.js')
const srvCategory = require(appPath+'/service/category.js')
require(appPath+'/ui/base/jquery/jquery.ctree.js')

class ProductPage extends ListPage{
    get $ctree(){
        return this._$ctree || (this._$ctree = this.$page.find('.ctree'))
    }
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table.product-list'))
    }
    get $tplPd(){
        return this._$tplPd || (this._$tplPd = this.$table.find('#tplPd'))
    }
    get $tplSpec(){
        return this._$tplSpec || (this._$tplSpec = this.$table.find('#tplSpec'))
    }
    get selectedSpecIds(){
        let ids = []
        let $checks = this.$table.find('.product-item-spec>.field-check>input[type=checkbox]:checked')
        for (let check of $checks){
            let id = this.getItemId(check)
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
            onDiscard: '.btn.discard',
            onRestore: '.btn.restore',
            onToggleDiscarded: '.btn.toggle-discarded',
            onDetail: '.product-item>tr>td',
        })
    }
    // showBtns(){
    // }
    prepareEvents(){
        super.prepareEvents()
        this.$page.find('.btn-category').click((e) => {
            router.loadMainPanel('category')
            e.stopPropagation()
        })
        let treeOpt = {
            root: {children: null},
            showIcon: false,
        }
        this.$ctree.cTree('init', treeOpt).on('ctree:load', (e, ctree, cnode) => {
            this.loadTree(ctree, cnode)
        }).on('ctree:click', (e, ctree, cnode) => {
            cnode && this.load({category:{code:cnode.code}})
        })
        router.$main.on('changed.category', (e, data) => {
            this.$ctree.cTree('refresh', treeOpt)
        })
        router.$main.on('changed.product', (e, data) => {
            this.reload()
        })

    }
    loadTree(ctree, cnode){
        srvCategory.loadTree().then(nodes => {
            ctree.load(nodes, cnode)
        })
    }
    get defaultParam(){
        let param = {
            orderBy: {code:1},
            paging: {pageSize: 10},
            discard: this._discard||false,
        }
        return param
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
