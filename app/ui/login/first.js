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
    onCancel(){
        router.loadMain()
    }
}

module.exports = FirstForm

// function({pid}){
//     let $p = $('#'+pid), $form = $p.find('form')
//
//     //加载数据
//     doLoad()
//     function doLoad(){
//         let pUser = srvUser.load()
//         let pComp = srvComp.load()
//         $.when(pUser, pComp).then((user, comp) => {
//             $form.input('values', {user, comp})
//         }).catch(err => {
//             console.log(err)
//         })
//     }
//
//     // 保存数据
//     let $confirm = $form.find('.btn.confirm').click(onSave)
//     function onSave(){
//         // if (!checkValid()){
//         //     return;
//         // }
//         doSave()
//     }
//     function doSave(){
//         $confirm.button('loading');
//         let data = $form.input('values');
//         let pUser = srvUser.save(data.user);
//         let pComp = srvComp.save(data.comp);
//         $.when(pUser, pComp).then(() => {
//             router.loadMain()
//             //$('body').trigger('changed.profile', [data])
//         }).finally(a => {
//             $confirm.button('reset')
//         }).catch(err => {
//             console.log(err)
//         })
//     }
//
//     // 跳过
//     let $cancel = $form.find('.btn.cancel').click(onCancel)
//     function onCancel(){
//         router.loadMain()
//     }
//
// }
