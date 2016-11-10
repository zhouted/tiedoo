const BaseForm = require(appPath+'/ui/base/base-form.js')
const BasePage = require(appPath+'/ui/base/base-page.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailPage extends BasePage  {
    get $title(){
        return this._$title || (this._$title = this.$page.find('.panel-title'))
    }
    get autosubs(){
        return {onLoaded:true}
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onEdit: '.btn.edit',
            onSave: '.btn.save',
        })
    }
    get $paneInfo(){
        return this._$paneInfo || (this._$paneInfo = this.$page.find('#customerDetailInfo'))
    }
    get paneInfo(){
        return this.$paneInfo.data('page')
    }
    get $paneContact(){
        return this._$paneContact || (this._$paneContact = this.$page.find('#customerDetailContact'))
    }
    get paneContact(){
        return this.$paneContact.data('page')
    }
    onEdit(e, btn){
        this.$page.input('edit')
    }
    onBack(e, btn){
        this.$page.input('read')
    }
    doLoad(param){
        return srvCust.loadById(param._id).then(data => {
            this._data = data
            this.updateTitle(data)
        })
    }
    updateTitle(customer){
        customer = customer || {}
        this.$title.find('.bind-customer-name').text(customer.name||'客户名称')
        this.$title.find('.bind-customer-createdAt').text(tfn.fdate(customer.createdAt||new Date()))
        // this.$title.find('.bind-customer-creator').text(customer.creator||'创建者')
        this.$title.find('.bind-customer-contact-name').text(customer.contacts && customer.contacts[0].name||'首要联系人')
    }
    checkFormData(){
        return this.$page.input('check')
    }
    onSave(e, btn){
        let valid = this.checkFormData()
        if (!valid){
            return
        }
        $(btn).button('loading')
        let p = this.doSave()
        if (!(p instanceof Promise)) {
            this.onSaved(e, btn)
            return
        }
        p.then(rst => {
            console.log(rst)
            this.$page.input('read', true)
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            this.onSaved(e, btn)
        })
    }
    getFormData(){
        let info = this.paneInfo.getFormData()
        let contacts = this.paneContact.getFormContacts()
        let data = tfn.merge({}, info, {contacts})
        return data
    }
    doSave(){
        let data = this.getFormData()
        return srvCust.save(data)
    }
    onSaved(e, btn){
        this.updateTitle()
        $(btn).button('reset')
    }
}

module.exports = CustomerDetailPage
