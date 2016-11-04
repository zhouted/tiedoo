const BasePage = require(appPath+'/ui/base/base-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerPage extends BasePage{
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table'))
    }
    get $tplTr(){
        return this._$tplTr || (this._$tplTr = this.$table.find('#tplTr'))
    }
    get selectedIds(){
        let ids = []
        let $checks = this.$table.find('input[type=checkbox]:checked')
        for (let check of $checks){
            let id = this.getItemId(check)
            id && ids.push(id)
        }
        return ids
    }
    getItemId(item){
        let $item = (item instanceof jQuery)? item : $(item)
        $item = $item.closest('tr')
        return $item.data('id')
    }
    get btns(){
        return Object.assign({}, super.btns, {
            onDetail: '.customer-item>td',
        })
    }
    prepareEvents(){
        super.prepareEvents()
        $('body').on('changed.customer', (e, data) => {
            this.reload(data)
        })
    }
    doLoad(){
        srvCust.load({}).then(custs => {
            this.$tplTr.siblings().remove()
            this.$tplTr.renderTpl(custs)
        })
    }
    toDetail(id){
        router.loadMainPanel('customerDetailPanel', {_id:id})
    }
    onDetail(e, target){
        let id = this.getItemId(target)
        if (!id) return
        this.toDetail(id)
    }
    onAddNew(){
        this.toDetail()
    }
    onDelete(){
        let p = this.selectedIds.map(id => srvCust.delete({_id: id}))
        Promise.all(p).then(() => {
            this.doLoad()
        })
    }
}

module.exports = CustomerPage
