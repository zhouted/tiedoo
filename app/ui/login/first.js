const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
const srvComp = require(appPath+'/service/company.js')

class FirstForm extends BaseForm {
    doLoad(){
        let pUser = srvUser.load()
        let pComp = srvComp.load()
        return $.when(pUser, pComp).then((user, comp) => {
            this.$form.input('values', {user, comp})
        })
    }
    doSave(){
        let data = this.getFormData();
        let pUser = srvUser.save(data.user);
        let pComp = srvComp.save(data.comp);
        $.when(pUser, pComp).then(() => {
            router.loadMain()
            //$('body').trigger('changed.user', [data.user]);$('body').trigger('changed.comp', [data.comp])
        })
    }
    onClose(){
        router.loadMain()
    }
}

module.exports = FirstForm
