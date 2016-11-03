const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailContactForm extends BaseForm {
    get $id(){
        return this._$id || (this._$id = this.$page.find('input[name=_id]'))
    }
    onShow(data){
        this.$id.val(data)
        data && this.load()
    }
    doLoad(){
        return srvCust.loadById(this.$id.val()).then(data => {
            this.setFormData(data&&data.contacts)
        })
    }
}

module.exports = CustomerDetailContactForm
