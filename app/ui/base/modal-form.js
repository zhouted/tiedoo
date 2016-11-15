const BaseForm = require(appPath+'/ui/base/base-form.js')

class ModalForm extends BaseForm{
    get $modal(){
        return this.$page.closest('.modal')
    }
    get $parentPage(){
        return this.$modal.closest('.ui-page')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onConfirm: '.btn.confirm, .btn-confirm',
            onCancel: '.btn.cancel, .btn-cancel',
        })
    }
    onConfirm(e, btn){
        this.onSave(e, btn)
    }
    // onCancel(e, btn){
    //     this.onBack(e, btn)
    // }
}

module.exports = ModalForm
