const srvLogin = require(appPath+'/service/login.js')
const srvUser = require(appPath+'/service/user.js')

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')
    $form.input('init')

    // 加载数据
    doLoad()
    function doLoad(){
        srvLogin.loadLoginUser().then(user => {
            $form.input('values', user)
            // $form.input('reading', true)
            loadImg()
        }).catch(err => {
            console.log(err)
        })
    }

    // 编辑、保存数据
    let $edit = $form.find('.btn.edit').click(function(){
        $form.input('edit')
    })
    let $back = $form.find('.btn.back').click(function(){
        $form.input('read')
    })
    let $save = $form.find('.btn.save').click(onSave)
    function onSave(){
        // if (!checkValid()){
        //     return;
        // }
        doSave()
    }
    function doSave(){
        $save.button('loading');
        let data = $form.input('values');
        let p = srvUser.save(data);
        p.then(user => {
            $form.input('read', true)
            //$('body').trigger('changed.profile', [data])
        }).finally(a => {
            $save.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }

    // 设置头像
    let $img = $form.find('img.image-preview')
    let $imgIpt = $form.find('input[name=imgId]')
    $imgIpt.inputImg({
        aspectRatio: 1 / 1
    }).on('done.cropper', function(e, file){
        $img.attr('src', file.data);
        srvUser.saveImg(file).then(file => {
            console.log(file)
            $imgIpt.data('fileId', file._id)
            $form.input('edit')
        })
    })
    function loadImg(){
        srvUser.loadImg($imgIpt.data('fileId')).then(file => {
            file && $img.attr('src', file.path)
        })
    }

}
