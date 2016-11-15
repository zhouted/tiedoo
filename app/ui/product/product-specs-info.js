const BasePane = require(appPath+'/ui/base/base-pane.js')
// const srvProduct = require(appPath+'/service/product.js')

class ProductSpecsInfo extends BasePane{
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table.data-list'))
    }
    get $tplTr(){
        return this._$tplTr || (this._$tplTr = this.$table.find('tbody>script[type="text/html"][role="template"]'))
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onDetail: '.data-item>td',
        })
    }
    // prepareEvents(){
    //     super.prepareEvents()
    // }
    // doLoad(param){
    //     return srvProduct.load(param)
    // }
    render(data){
        this.$tplTr.siblings('tbody').remove()
        this.$tplTr.renderTpl(data)
    }
    toDetail(id){
        // router.loadMainPanel('productDetailPanel', {_id:id})
    }
    onDetail(e, target){
        let id = this.getItemId(target)
        if (!id) return
        this.toDetail(id)
    }
}

module.exports = ProductSpecsInfo
