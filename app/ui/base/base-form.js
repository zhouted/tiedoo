class BaseForm{
    constructor({pid}){
        this._pid = pid
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
    }
    initClicks(){
        let clicks = {onEdit: '.btn.edit', onBack: '.btn.back', onSave: '.btn.save'}
        for (let btn in clicks){
            let cls = clicks[btn]
            let click = this[btn]
            if (typeof(click) === 'function'){
                this.$page.on('click', cls, (e) => {
                    click(e, this)
                })
            }
        }
    }
    onEdit(e){
        this.$form.input('edit')
    }
    onBack(e){
        this.$form.input('read')
    }
    onSave(e){
        let valid = this.$form.input('check')
        if (!valid){
            return
        }
        this.doSave()
    }
    load(){

    }
    doSave(){

    }

}

module.exports = BaseForm
