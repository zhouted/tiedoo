const srvLogin = require(appPath+'/service/login.js')
const srvUser = require(appPath+'/service/user.js')

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
    let $imgId = $form.find('input[name=imgId]')
    $imgId.change(function(){
        $img.attr('src', this.files[0].path)
        srvUser.saveImg(this.files[0]).then(file => {
            console.log(file)
            $imgId.data('fileId', file._id)
            $img.attr('src', file.path)
        })
        // let file = new FileReader()
        // file.onload = function(e){
        //      $img.attr('src', e.target.result)
        // }
        // file.readAsDataURL(this.files[0])
    })
    function loadImg(){
        srvUser.loadImg($imgId.data('fileId')).then(file => {
            $img.attr('src', file.path)
        })
    }


}
