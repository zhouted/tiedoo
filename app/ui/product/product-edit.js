const ListPage = require(appPath+'/ui/base/list-page.js')
const srvProduct = require(appPath+'/service/product.js')
const srvCategory = require(appPath+'/service/category.js')
require(appPath+'/ui/base/jquery/jquery.ctree.js')

class ProductPage extends ListPage{
    prepare(){
        super.prepare()
        this._forceLoad = true
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
    initEvents(){
        super.initEvents()
        this.initCategory()
        router.$main.on('changed.product', (e, data) => {
            this.reload()
        })
    }
    initCategory(){
        // let treeOpt = {
        //     root: {children: null},
        //     showIcon: false,
        // }
        // this.$ctree.cTree('init', treeOpt)
        // this.$ctree.on('ctree:load', (e, ctree, cnode) => {
        //     srvCategory.loadTree('',{unclassified:true}).then(nodes => {
        //         ctree.load(nodes, cnode)
        //     })
        // }).on('ctree:click', (e, ctree, cnode) => {
        //     cnode && this.load({category:{code:cnode.code}})
        // })
        // router.$main.on('changed.category', (e, data) => {
        //     this.$ctree.cTree('refresh', treeOpt)
        // })
        // this.$page.find('.btn-category').click((e) => {
        //     router.loadMainPanel('category')
        //     e.stopPropagation()
        // })
    }
    get defaultParam(){
        return {
            orderBy: {code:1},
            paging: {pageSize: 10},
        }
    }
    doLoad(param){
        return srvProduct.load(param)
    }
    render(data){
        this.$tplPd.prevAll('tbody').remove()
        for (let pd of data) {
            let $item = $(tfn.template(this.$tplPd, pd)).data('pd', pd)
            let specs = pd.specs||[]
            for (let spec of specs){
                let $sItem = $(tfn.template(this.$tplSpec, spec)).data('spec', spec)
                $item.append($sItem)
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
    getPageData(){
        let pds = this._data = this._data||[]
        let $pdItems = this.$table.find('.product-item')
        for (let pdItem of $pdItems){
            let $pdItem = $(pdItem)
            let pd = $pdItem.data('pd')
            let $basic = $pdItem.find('.product-item-basic')
            let basic = $basic.input('value')
            tfn.merge(pd, basic)
            let $specItems = $pdItem.find('.product-item-spec')
            for (let specItem of $specItems){
                let $specItem = $(specItem)
                let spec = $specItem.data('spec')
                let specEx = $specItem.input('value')
                tfn.merge(spec, specEx)
                if (!pd.specs.includes(spec)){
                    pd.specs.push(spec)
                }
            }
            if (!pds.includes(pd)){
                pds.push(pd)
            }
        }
        return pds
    }
    doSave(data){
        console.log(data)
    }
    toDetail(id){
        // router.loadMainPanel('productDetail', {_id:id, _discard:this._discard})
    }
    onDetail(e, target){
        // let id = this.getItemPdId(target)
        // if (!id) return
        // this.toDetail(id)
    }
    onAddNew(e, btn){
        // this.toDetail()
    }
    onDelete(e, btn){
        // let ids = this.checkedSpecIds
        // if (!ids.length){
        //     tfn.tips('请先选择要删除的记录！', 'warning')
        //     return
        // }
        // if (!window.confirm(`确认删除这个${ids.length}产品规格吗？`)){
        //     return
        // }
        // let p = srvProduct.removeSpecByIds(ids)
        // p.then((rst) => {
        //     this.clearChecked()
        //     this.reload()
        // })
    }
    onHide(){
        if (this._modified){
            if (!window.confirm('确认取消修改？')) return false
            // this.render(this._data)
            this._modified = false
        }
        return true
    }
    onBack(e, btn){
        router.loadMainPanel('product')
    }
}

module.exports = ProductPage
