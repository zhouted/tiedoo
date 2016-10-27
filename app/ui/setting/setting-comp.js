const srvComp = require(appPath+'/service/company.js')

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')

    //加载数据
    doLoad()
    function doLoad(){
        srvComp.load().then(comp => {
            $form.input('values', comp)
            loadImg()
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

    let $img = $form.find('img.image-preview')
    let $imgIpt = $form.find('input[name=imgId]')
    $imgIpt.inputImg().change(function(){
        let file = this.files[0]
        if (!file || !file.path) return
        $img.attr('src', file.path);
        srvComp.saveImg(file).then(file => {
            console.log(file)
            $imgIpt.data('fileId', file._id)
            $imgIpt.val('') //reset file input
        })
    })

    function loadImg(){
        srvComp.loadImg($imgIpt.data('fileId')).then(file => {
            file && $img.attr('src', file.path)
        })
    }

}
