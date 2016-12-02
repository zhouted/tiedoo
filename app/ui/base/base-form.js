const BasePane = require(appPath+'/ui/base/base-pane.js')

class BaseForm extends BasePane{
    get $form(){
        return this._$form || (this._$form = this.$page.find('form').first())
    }
    prepareEvents(){
        this._autoRead = true
        super.prepareEvents()
        this.$form.input('init')
        this.initValidators()
    }
    initValidators(){
        this.$form.find('.form-control.check-on-change').change(function(e){
            return $(this).input('check')
        })
    }
    toEdit(){
        this.$form.input('edit')
    }
    toRead(){
        this._modified = false
        this.$form.input('read')
    }
    render(data){
        this.setFormData(data)
    }
    checkPageData(){
        return this.checkFormData()
    }
    getPageData(){ //get data to save
        return this.getFormData()
    }
    checkFormData(){
        return this.$form.input('check')
    }
    setFormData(data){
        this.$form.input('values', data||{})
    }
    getFormData(){
        return this.$form.input('values')
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
    }
}

module.exports = BaseForm
