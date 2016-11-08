const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailInfoForm extends BaseForm {
    get $id(){
        return this._$id || (this._$id = this.$form.find('input[name=_id]'))
    }
    prepareEvents(){
        super.prepareEvents()
        router.$main.on('changed.customer', (e, data) => {
            if (data && data._id && !this.$id.val()){
                this.$id.val(data._id)
                this.setStub({_id: data._id})
            }
        })
    }
    doLoad(param){
        return srvCust.loadById(param._id).then(data => {
            this.setFormData(data)
            !data && this.$form.input('edit')
        })
    }
    doSave(){
        let data = this.getFormData()
        return srvCust.save(data).then(rst => {
            router.$main.trigger('changed.customer', [rst])
        })
    }
}

module.exports = CustomerDetailInfoForm
