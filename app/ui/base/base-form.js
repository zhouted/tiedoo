const BasePane = require(appPath+'/ui/base/base-pane.js')

class BaseForm extends BasePane{
    get $form(){
        return this._$form || (this._$form = this.$page.find('form').first())
    }
    prepareEvents(){
        super.prepareEvents()
        this.$form.input('init')
        this.initValidators()
    }
    get btns(){
        return tfn.merge({}, super.btns, {
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
        this.$form.input('values', data||{})
        this.$form.input('read', true)
    }
    getFormDataArray(groupBy = 'fieldset'){
        let datas = []
        let $groups = this.$form.find(groupBy)
        for (let group of $groups){
            let data = $(group).input('values')
            !$.isEmptyObject(data) && datas.push(data)
        }
        return datas
    }
    setFormDataArray(datas, groupBy = 'fieldset', $scope = null){
        if (!datas || !datas.length) return
        let $groups = $scope || this.$form
        if (!$groups.is(groupBy)){
            $groups = $scope.find(groupBy)
        }
        for (let group of $groups){
            let $group = $(group)
            let data = datas[$group.index()]
            data && $group.input('values', data)
        }
        this.$form.input('read', true)
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
        // return srvXXX.save(data)
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
