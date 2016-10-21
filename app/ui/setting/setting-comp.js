const srvComp = require(appPath+'/service/comp.js')

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')

    //加载数据
    doLoad()
    function doLoad(){
        srvComp.load().then(comp => {
            $form.input('values', comp)
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
        let p = srvComp.save(data);
        p.then(user => {
            //$('body').trigger('changed.profile', [data])
        }).finally(a => {
            $confirm.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }
    console.log($confirm)
}
