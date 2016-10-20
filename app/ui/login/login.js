const mUser = require(appPath+'/mdl/user.js')
const mCur = require(appPath+'/mdl/current.js')
const {RE_EMAIL: reEmail, RE_MOBILE: reMobile} = require(appPath+'/base/pubs/consts.js')

exports.init = function({pid}) {
    let $login = $('#'+pid)
    let $form = $login.find('form');
    let $confirm = $login.find('.btn.confirm')
    let $account = $form.find('input[name=account]').focus()
    let $pwd = $form.find('input[name=pwd]')

    // 显示上次登录用户
    mUser.getCurUser().then(user => {
        if (user){
            $account.val(user.account)
            $pwd.focus()
        }
    })

    // 按回车键触发确认按钮
    $form.on('keyup', '.form-control', onKeyup);
    function onKeyup(e){
        let code = e.which
        if (code == 13){
            $confirm.trigger('click')
        }
    }

     // 登录和注册 交互处理
    $confirm.click(onLogin);
    function onLogin(){
        let account = $account.val()
        if (!$account.val()){
            return $account.focus()
        }
        if (!reEmail.test(account) && !reMobile.test(account)){
            alert('输入的账号不是合法的手机号或邮箱地址！')
            return $account.focus()
        }

        if (!$pwd.val()){
            return $pwd.focus()
        }
        let $pwdAg = $form.find('input[name=pwdAg]')
        if ($pwdAg.is(':visible')){
            if (!$pwdAg.val()){
                return $pwdAg.focus()
            }
            if ($pwdAg.val() !== $pwd.val()){
                alert('密码不一致！')
                return $pwdAg.focus()
            }
            let $agree = $form.find('input[name=agree]')
            if (!$agree.prop('checked')){
                return alert('您必须同意服务协议才能使用本软件！')
            }
        }
        doLogin()
    }
    function doLogin() {
        $confirm.button('loading')
        let data = $form.input('values')
        let p = mUser.login(data)
        p.then(rst => {
            if (rst.passed && rst.user) {
                if (rst.user/*.isNew*/){
                    loginFirst()
                }else{
                    router.loadMain()
                }
            } else if (rst.user) {
                alert('密码错误！')
            } else { // 用户未注册
                showRegister()
            }
        }).finally(a => {
            $confirm.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }
    function showRegister() { // 显示隐藏的注册输入项
        $login.find('.register-more').removeClass('hidden')
        setTimeout(()=>{
            $form.find('input[name=pwdAg]').focus()
        })
    }
    function loginFirst(){ // 首次登录 完善资料
        $('body').loadFile('ui/login/first.html')
    }

}
