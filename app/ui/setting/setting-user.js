const srvUser = require(appPath+'/service/user.js')
const {RE_EMAIL: reEmail, RE_MOBILE: reMobile} = require(appPath+'/apps/consts.js')

exports.init = function({pid}){
    let $p = $('#'+pid), $form = $p.find('form')
    $form.input('init')

    // 加载数据
    doLoad()
    function doLoad(){
        srvUser.loadCurrUser().then(user => {
            $form.input('values', user)
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
        let $account = $form.find('input[name=account]')
        let account = $account.val()
        if (!$account.val()){
            return $account.focus()
        }
        if (!reEmail.test(account) && !reMobile.test(account)){
            alert('输入的账号不是合法的手机号或邮箱地址！')
            return $account.focus()
        }
        if (!$form.input('check')){
            return;
        }
        doSave()
    }
    function doSave(){
        $save.button('loading');
        let data = $form.input('values');
        let p = srvUser.save(data);
        p.then(user => {
            $form.input('read', true)
            $('body').trigger('changed.user', [data])
        }).finally(a => {
            $save.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }

    // 设置头像
    let $img = $form.find('img.image-preview')
    let $imgIpt = $form.find('input[name=imageId]')
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

    //修改密码按钮
    let $passwd = $form.find('.btn.passwd').click(function(){
        $p.addFile('ui/setting/setting-pwd.html').then(() => {
            let $modal = $('#passwdModal')
            $modal.modal('show')
        }).catch(err => {
            console.error(err)
        })
    })
}
