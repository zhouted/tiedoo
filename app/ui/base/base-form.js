const BasePage = require(appPath+'/ui/base/base-page.js')

class BaseForm extends BasePage{
    get $form(){
        return this._$form || (this._$form = this.$page.find('form'))
    }
    init(){
        this.$form.input('init')
        super.init()
        this.initValidators()
    }
    get btns(){
        return Object.assign({}, super.btns, {
            onEdit: '.btn.edit',
            onSave: '.btn.save',
            onConfirm: '.btn.confirm',
            onCancel: '.btn.cancel',
        })
    }
    initValidators(){
        this.$form.find('.form-control.check-on-change').change(function(e){
            return $(this).input('check')
        })
    }
    onEdit(e, btn){
        this.$form.input('edit')
    }
    onBack(e, btn){
        this.$form.input('read')
    }
    checkFormData(){
        return this.$form.input('check')
    }
    getFormData(){
        return this.$form.input('values')
    }
    setFormData(data){
        this.$form.input('values', data)
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
            this.$form.input('read', true)
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            this.onSaved(e, btn)
        })
    }
    doSave(){
        // let data = this.getFormData()
    }
    onSaved(e, btn){
        $(btn).button('reset')
    }
    onConfirm(e, btn){
        this.onSave(e, btn)
    }
    onCancel(e, btn){
        this.onBack(e, btn)
    }
}

module.exports = BaseForm