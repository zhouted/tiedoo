const BaseForm = require(appPath+'/ui/base/base-form.js')

class ModalForm extends BaseForm{
    get $modal(){
        return this.$page
    }
    // get clicks(){
    //     return Object.assign(super.clicks, {onConfirm: '.btn.confirm'})
    // }
    // onConfirm(e, btn){
    //     super.onSave(e, btn)
    // }
}

module.exports = ModalForm
