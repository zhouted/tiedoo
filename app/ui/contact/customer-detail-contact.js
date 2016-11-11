const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailContactForm extends BaseForm {
    get $tpl(){
        return this._$tpl || (this._$tpl = this.$form.find('#tplFs'))
    }
    get btns(){
        return tfn.merge({}, super.btns, {onMoveUp: '.btn-move-up'})
    }
    render(customer){
        let $tpl = this.$tpl
        let contacts = customer&&customer.contacts
        $tpl.siblings('.contact-item').remove()
        if (contacts && contacts.length){
            let $contacts = tfn.template($tpl, contacts)
            $contacts = $($contacts.join(''))
            this.setFormDataArray(contacts, '.contact-item', $contacts)
            $tpl.before($contacts)
        }else{
            this.addNew()
        }
        // this.reindex()
    }
    getFormData(){
        return this.getFormDataArray('.contact-item')
    }
    // onAddNew(e, btn){
    //     this.addNew(btn)
    // }
    addNew(btn){
        let contact = {name: ''}
        let $contact = $(tfn.template(this.$tpl, contact))
        $contact.input('values', contact)
        if (btn) {
            $(btn).closest('.contact-item').after($contact)
        }else{
            this.$tpl.before($contact)
        }
        $contact.find('input:first').focus()
        // this.reindex()
    }
    onDelete(e, btn){
        let $contact = $(btn).closest('.contact-item')
        $contact.remove()
        // this.reindex()
    }
    onMoveUp(e, btn){
        let $item = $(btn).closest('.contact-item')
        $item.parent().prepend($item)
        $item.find('input:first').focus()
        // $item.after($item.prev('.contact-item'))
        // this.reindex()
    }
    // reindex(){
    //     let $items = this.$form.find('.contact-item');
    //     for (let item of $items){
    //         let $item = $(item)
    //         $item.find('.item-index').text($item.index()+1)
    //     }
    //     if ($items.length <= 1){
    //         $items.find('.btn-delete').addClass('hidden')
    //     }else{
    //         $items.find('.btn-delete').removeClass('hidden')
    //     }
    // }
}

module.exports = CustomerDetailContactForm
