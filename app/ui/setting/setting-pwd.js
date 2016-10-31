const srvUser = require(appPath+'/service/user.js')

exports.init = function({pid}){
    let $modal = $('#'+pid)
    let $form = $modal.find('form')

    let $pwdOld = $form.find('input[name=pwdOld]')
    $pwdOld.off('change').change(function(){
        let pwd = $pwdOld.val()
        if (!pwd) return
        srvUser.checkPasswd(pwd).then((pass) => {
            if (!pass){
                window.alert('原密码错误！')
                $pwdOld.focus()
            }
        })
    })

    let $confirm = $modal.find('.btn.confirm')
    $confirm.off('click').click(function(){
        let $pwdOld = $form.find('input[name=pwdOld]')
        let pwdOld = $pwdOld.val()
        if (!pwdOld){
            return $pwdOld.focus()
        }

        let $pwd = $form.find('input[name=pwd]')
        let pwd = $.trim($pwd.val())
        if (!pwd){
            $pwd.val(pwd)
            return $pwd.focus()
        }

        let $pwdAg = $form.find('input[name=pwdAg]')
        if (!$pwdAg.val()){
            return $pwdAg.focus()
        }
        if ($pwdAg.val() !== pwd){
            alert('两次输入的密码不一致！')
            return $pwdAg.focus()
        }

        $confirm.button('loading')
        srvUser.changePasswd(pwdOld, pwd).then((rst) => {
            console.log(rst)
            $form[0].reset()
            $modal.modal('hide')
        }).catch((err) => {
            window.alert(err)
        }).finally(() => {
            $confirm.button('reset')
        })
    })

}
