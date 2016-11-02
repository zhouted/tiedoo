const BasePage = require(appPath+'/ui/base/base-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerPage extends BasePage{
    get $table(){
        return this._$table || (this._$table = this.$page.find('.table'))
    }
    get $tplTr(){
        return this._$tplTr || (this._$tplTr = this.$table.find('script[role=template]'))
    }
    get selectedIds(){
        let ids = []
        let $checks = this.$table.find('input[type=checkbox]:checked')
        for (let check of $checks){
            let $tr = $(check).closest('tr')
            let id = $tr.data('id')
            id && ids.push(id)
        }
        return ids
    }
    // get btns(){
    //     return Object.assign({}, super.btns, {
    //         onDelete: '.btn.delete',
    //     })
    // }
    doLoad(){
        srvCust.load({}).then(custs => {
            // custs = [{},{},{},{},{}]
            this.$tplTr.siblings().remove()
            this.$tplTr.renderTpl(custs)
        })
    }
    onAddNew(){
        let n = Math.ceil(Math.random()*100)
        srvCust.save({name: '客户'+n, addr: '地址'+n}).then(rst => {
            console.log(rst)
            this.doLoad()
        })
    }
    onDelete(){
        // for (let id of this.selectedIds){
        //     srvCust.delete({_id: id})
        // }
        let p = this.selectedIds.map(id => srvCust.delete({_id: id}))
        Promise.all(p).then(() => {
            this.doLoad()
        })
    }
}

module.exports = CustomerPage
