const mUser = require(appPath+'/mdl/user.js')

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')

    //加载数据
    doLoad()
    function doLoad(){
        mUser.getCurUser().then(user => {
            $form.input('values', user)
        }).catch(err => {
            console.log(err)
        })
    }

    // 保存数据
    let $confirm = $form.find('.btn.confirm').click(onSave)
    function onSave(){
        // if (!checkValid()){
        //     return;
        // }
        doSave()
    }
    function doSave(){
        $confirm.button('loading');
        let data = $form.input('values');
        let p = mUser.save(data);
        p.then(user => {
            router.loadMain()
            //$('body').trigger('changed.profile', [data])
        }).finally(a => {
            $confirm.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }

    // 跳过
    let $cancel = $form.find('.btn.cancel').click(onCancel)
    function onCancel(){
        router.loadMain()
    }

}
