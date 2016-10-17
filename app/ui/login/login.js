const mUser = require(appPath + '/mdl/user.js')

function init(loginId) {
    console.log('login loaded!' + loginId);
    let $login = $(loginId);
    let $form = $login.find('form');
    mUser.getCurUser().then(user => {
        if (user){
            $form.find('input[name=email]').val(user.email)
        }
    })

    let $confirm = $login.find('.btn.confirm')
    $confirm.click(doLogin);

    function doLogin() {
        $confirm.button('loading');
        let data = toPO($form);
        let p = mUser.login(data);
        p.then(rst => {
            console.log(rst)
            if (rst.passed) {
                //router.loadMain(rst.user)
                router.showProfile()
            } else if (rst.user) {
                alert('密码错误！')
            } else {
                showRegister()
            }
        }).finally(a => {
            $confirm.button('reset')
        }).catch(err => {
            console.log(err)
        })
    }

    function showRegister() {
        $login.find('.register-more').removeClass('hidden')
    }

}

function toPO($form) { //TODO: move to jquery.forms plugin
    let po = {}
    let values = $form.serializeArray();
    for (value of values) {
        po[value.name] = value.value;
    }
    return po;
}

module.exports = {
    init
}
