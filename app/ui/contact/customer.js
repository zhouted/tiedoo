const ListPage = require(appPath+'/ui/base/list-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerPage extends ListPage{
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table'))
    }
    get $tplTr(){
        return this._$tplTr || (this._$tplTr = this.$table.find('#tplTr'))
    }
    get btns(){
        return tfn.clone(super.btns, {
            onDetail: '.customer-item>td',
        })
    }
    get group(){
        return this._pid[0]//return c-customer or s-supplier
    }
    get groupName(){
        return (this.group==='s')? '供应商' : '客户'
    }
    prepare(){
        super.prepare()
        this.$page.find('.customer-group-name').text(this.groupName)
    }
    initEvents(){
        super.initEvents()
        router.$main.on('changed.customer', () => {
            this.reload()
        })
    }
    get defaultParam(){
        return tfn.merge(super.defaultParam, {group: this.group, paging:{pageSize:10}})
    }
    doLoad(param){
        return srvCust.load(param)
    }
    render(data){
        this.$tplTr.prevAll('tr').remove()
        this.$tplTr.renderTpl(data)
    }
    doSearch(text){
        this.load({key: text})
    }
    toDetail(id){
        router.loadMainPanel(this.pid+'Detail', {_id:id})
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
        let ids = this.checkedIds
        if (!ids.length){
            tfn.tips('请先选择要删除的记录！', 'warning')
            return
        }
        if (!window.confirm(`确认删除这个${ids.length}客户吗？`)){
            return
        }
        let p = srvCust.removeByIds(ids)
        p.then(() => {
            this.reload()
        })
    }
}

module.exports = CustomerPage
