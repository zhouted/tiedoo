const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailContactForm extends BaseForm {
    get _id(){// customerId
        return this._param && this._param._id
    }
    set _id(id){
        if (!this._param){
            this._param = {}
        }
        this._param._id = id
    }
    get $tpl(){
        return this._$tpl || (this._$tpl = this.$form.find('#tplFs'))
    }
    get btns(){
        return tfn.merge({}, super.btns, {onMoveUp: '.btn-move-up'})
    }
    prepareEvents(){
        super.prepareEvents()
        router.$main.on('changed.customer', (e, data) => {
            if (data && data._id && !this._id){
                this._id = data._id
                this.setStub({_id: data._id})
            }
        })
    }
    doLoad(param){
        let $tpl = this.$tpl
        return srvCust.loadById(param._id).then(data => {
            let contacts = data&&data.contacts
            $tpl.siblings('.contact-item').remove()
            if (contacts && contacts.length){
                let $contacts = tfn.template($tpl, contacts)
                $contacts = $($contacts.join(''))
                this.setFormDataArray(contacts, '.contact-item', $contacts)
                $tpl.before($contacts)
                this.$form.input('read', true)
            }else{
                this.addNew()
                this.$form.input('edit')
            }
            this.reindex()
        })
    }
    doSave(){
        let contacts = this.getFormDataArray('.contact-item')
        let data = {_id: this._id, contacts}
        return srvCust.save(data).then(rst => {
            router.$main.trigger('changed.customer', [rst])
        })
    }
    onAddNew(e, btn){
        this.addNew(btn)
    }
    addNew(btn){
        let contact = {name: ''}
        let $contact = $(tfn.template(this.$tpl, contact))
        $contact.input('values', contact)
        if (btn) {
            $(btn).closest('.contact-item').after($contact)
        }else{
            this.$tpl.before($contact)
        }
        this.reindex()
    }
    onDelete(e, btn){
        let $contact = $(btn).closest('.contact-item')
        $contact.remove()
        this.reindex()
    }
    onMoveUp(e, btn){
        let $item = $(btn).closest('.contact-item')
        $item.after($item.prev('.contact-item'))
        this.reindex()
    }
    reindex(){
        let $items = this.$form.find('.contact-item');
        for (let item of $items){
            let $item = $(item)
            $item.find('.item-index').text($item.index()+1)
        }
        if ($items.length <= 1){
            $items.find('.btn-delete').addClass('hidden')
        }else{
            $items.find('.btn-delete').removeClass('hidden')
        }
    }
}

module.exports = CustomerDetailContactForm
