const BasePane = require(appPath+'/ui/base/base-pane.js')
const srvProduct = require(appPath+'/service/product.js')

class ProductSpecsInfo extends BasePane{
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table.data-list'))
    }
    get $tplTr(){
        return this._$tplTr || (this._$tplTr = this.$table.find('tbody>script[type="text/html"][role="template"]'))
    }
    get btns(){
        return tfn.clone(super.btns, {
            onDetail: '.data-item>td',
        })
    }
    render(data){
        this.$tplTr.siblings('tr').remove()
        this.$tplTr.renderTpl(data)
        this.loadImg()
    }
    loadImg(){
        this.$table.find('.data-item img[data-id]').each((i, img) => {
            let $img = $(img), imageId = $img.data('id')
            srvProduct.loadImg(imageId).then(file => {
                file && $img.attr('src', file.path)
            })
        })
    }
    getItemId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('tr')
        return $item.data('id')
    }
    onDetail(e, target){
        let id = this.getItemId(target)
        if (!id) return
        this.$parentPage.trigger('open.spec.product', [id])
    }
}

module.exports = ProductSpecsInfo
