const ListPage = require(appPath+'/ui/base/list-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerPage extends ListPage{
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
        router.$main.on('changed.customer', (e, data) => {
            this.reload()
        })
    }
    doLoad(param){
        return srvCust.load(param).then(custs => {
            this.$tplTr.siblings().remove()
            this.$tplTr.renderTpl(custs)
        })
    }
    doSearch(text){
        this.load({key: text})
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
        let ids = this.selectedIds
        if (!ids.length){
            tfn.tips('请先选择要删除的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认删除这个${ids.length}客户吗？`)){
            return
        }
        let p = ids.map(id => srvCust.delete({_id: id}))
        Promise.all(p).then(() => {
            this.reload()
        })
    }
}

module.exports = CustomerPage
