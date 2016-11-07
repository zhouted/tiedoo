const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvCust = require(appPath+'/service/customer.js')

class CustomerDetailContactForm extends BaseForm {
    get $id(){
        return this._$id || (this._$id = this.$page.find('input[name=_id]'))
    }
    get $tpl(){
        return this._$tpl || (this._$tpl = this.$form.find('#tplFs'))
    }
    reload(data){
        this.$id.val(data&&data._id)
        super.reload()
    }
    // doResize(){null;}
    doLoad(){
        let _id = this.$id.val()
        let $tpl = this.$tpl
        return srvCust.loadById(_id).then(data => {
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
        })
    }
    doSave(){
        let _id = this.$id.val()
        let contacts = this.getFormDataArray('.contact-item')
        return srvCust.save({_id, contacts})
    }
    onAddNew(e, btn){
        this.addNew()
    }
    addNew(){
        let contact = {name: ''}
        let $contact = $(tfn.template(this.$tpl, contact))
        $contact.input('values', contact)
        this.$tpl.before($contact)
    }
    onDelete(e, btn){
        let $contact = $(btn).closest('.contact-item')
        $contact.remove()
    }
}

module.exports = CustomerDetailContactForm
