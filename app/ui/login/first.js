const BaseForm = require(appPath+'/ui/base/base-form.js')
const srvUser = require(appPath+'/service/user.js')
// const srvComp = require(appPath+'/service/company.js')

class FirstForm extends BaseForm {
    doLoad(){
        return srvUser.load()
        // let pUser = srvUser.load()
        // let pComp = srvComp.load()
        // $.when(pUser, pComp).then((user, comp) => {
        //     this.$form.input('values', {user, comp})
        // })
    }
    doSave(user){
        return srvUser.save(user).then(() => {
            router.loadMain()
        })
        // let pUser = srvUser.save(data.user);
        // let pComp = srvComp.save(data.comp);
        // return $.when(pUser, pComp).then(() => {
        //     router.loadMain()
        // })
    }
    onCancel(){
        router.loadMain()
    }
}

module.exports = FirstForm
