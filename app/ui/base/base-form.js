class BaseForm{
    constructor({pid}){
        this._pid = '#'+pid
    }
    get pid(){
        return this._pid
    }
    get $page(){
        return this._$page || (this._$page = $(this._pid))
    }
    get $form(){
        return this._$form || (this._$form = this.$page.find('form'))
    }
    init(){
        this.$form.input('init')
        this.load()
        this.initClicks()
        this.initValidators()
    }
    get clicks(){
        return this._clicks || (this._clicks = {
            onEdit: '.btn.edit',
            onSave: '.btn.save',
            onBack: '.btn.back',
            onConfirm: '.btn.confirm',
            onCancel: '.btn.cancel',
        })
    }
    initClicks(){
        let self = this
        for (let btn in this.clicks){
            let cls = this.clicks[btn]
            let click = self[btn]
            if (typeof(self[btn]) === 'function'){
                self.$page.off('click', cls).on('click', cls, function(e){
                    self[btn](e, this)
                })
            }
        }
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
    load(){
        let p = this.doLoad()
        if (!(p instanceof Promise)) {
            this.onLoaded()
            return
        }
        p.catch(err => {
            console.log(err)
        }).finally(() => {
            this.onLoaded()
        })
    }
    doLoad(){
        // this.setFormData(data)
    }
    onLoaded(){

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
