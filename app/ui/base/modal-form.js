const BaseForm = require(appPath+'/ui/base/base-form.js')

class ModalForm extends BaseForm{
    get $modal(){
        return this.$page
    }
    // get btns(){
    //     return Object.assign({}, super.btns, {onConfirm: '.btn.confirm'})
    // }
    // onConfirm(e, btn){
    //     super.onSave(e, btn)
    // }
}

module.exports = ModalForm