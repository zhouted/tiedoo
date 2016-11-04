const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailInfoForm extends BaseForm {
    get $id(){
        return this._$id || (this._$id = this.$page.find('input[name=_id]'))
    }
    reload(data){
        this.$id.val(data&&data._id||'')
        super.reload()
    }
    doLoad(){
        return srvCust.loadById(this.$id.val()).then(data => {
            this.setFormData(data)
            !data && this.$form.input('edit')
        })
    }
    doSave(){
        let data = this.getFormData()
        return srvCust.save(data).then(cust => {
            $('body').trigger('changed.customer', [data])
        })
    }
}

module.exports = CustomerDetailInfoForm
