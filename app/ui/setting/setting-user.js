const srvLogin = require(appPath+'/service/login.js')
const srvUser = require(appPath+'/service/user.js')

require(appPath+'/ui/base/jquery/jquery.crop-image.js')//$.fn.cropInput

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')

    //加载数据
    doLoad()
    function doLoad(){
        srvLogin.loadLoginUser().then(user => {
            $form.input('values', user)
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
        let p = srvUser.save(data);
        p.then(user => {
            //$('body').trigger('changed.profile', [data])
        }).finally(a => {
            $confirm.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }

    let $img = $form.find('#img')
    let $imgIpt = $form.find('input[name=imgId]')
    $imgIpt.cropImage({
        aspectRatio: 1 / 1
    }).on('done.cropper', function(e, file){
        $img.attr('src', file.data);
        srvUser.saveImg(file).then(file => {
            console.log(file)
            $imgIpt.data('fileId', file._id)
            //loadImg()
        })
    })
    
    function loadImg(){
        srvUser.loadImg($imgIpt.data('fileId')).then(file => {
            file && $img.attr('src', file.path)
        })
    }


}
