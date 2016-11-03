const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailInfoForm extends BaseForm {
    get $id(){
        return this._$id || (this._$id = this.$page.find('input[name=_id]'))
    }
    onShow(data){
        this.$id.val(data)
        data && this.load()
    }
    doLoad(){
        return srvCust.load({_id: this.$id.val()}).then(data => {
            if (data && data.length){
                this.setFormData(data[0])
            }
        })
    }
}

module.exports = CustomerDetailInfoForm
