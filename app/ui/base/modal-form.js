const BaseForm = require(appPath+'/ui/base/base-form.js')

class ModalForm extends BaseForm{
    get $modal(){
        return this.$page.closest('.modal')
    }
    get btns(){
        return tfn.merge({}, super.btns, {
            onConfirm: '.btn.confirm, .btn-confirm',
        })
    }
    prepareEvents(){
        super.prepareEvents()
        // on modal show...
        this.$modal.on('show.bs.modal', (e)=>{
            let stub = this.$modal.data('_spv')
            this.onShow(stub)
        })
        this.$modal.on('shown.bs.modal', (e)=>{
            this.onShown()
        })
        // on modal hide...
        this.$modal.on('hide.bs.modal', (e)=>{
            return this.onHide()
        })
        this.$modal.on('hidden.bs.modal', (e)=>{
            this.onHidden()
        })
    }
    onConfirm(e, btn){
        if (!this._modified) {
            this.$modal.modal('hide')
            return
        }
        this.onSave(e, btn)
    }
    onSaved(data, rst){
        super.onSaved(data, rst)
        this.$modal.modal('hide')
    }
    onHide(){
        if (this.isEditing && this._modified){
            if (!window.confirm('确认取消修改？')) return false
            this._modified = false
            this.render(this._data)
        }
    }
}

module.exports = ModalForm
