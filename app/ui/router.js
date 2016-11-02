const srvUser = require(appPath+'/service/user.js')

var router = {}

router.gohome = function(){
    srvUser.loadToken().then(token => {
        if (token && token.active){
            srvUser.autoLogin(token)
            router.loadMain()
        }else{
            router.showLogin()
        }
    }).catch(err => {
        console.error(err)
    })
}

router.showLogin = function() {
    $('body').loadFile('ui/login/login.html').catch(err => {
        console.error(err)
    })
}

router.logout = function(){
    srvUser.logout().then(() => {
        router.showLogin()
    }).catch(err => {
        console.error(err)
    })
}

router.loadMain = function () {
    $('body').loadFile('ui/main/main.html').then(()=>{
        let mainPanel = tfn.store('mainPanel')||'settingPanel'
        router.loadMainPanel(mainPanel)
    }).catch(err => {
        console.error(err)
    })
}

router.loadMainPanel = function(panelId) {
    $('#main').spv('open', panelId)
    tfn.store('mainPanel', panelId)
}

// 图片剪裁弹窗(传入file input)
router.showCropper = function(ipt){
    let opts = {id: 'cropModal', append: true}
    return $('body').loadFile('ui/common/crop-modal.html', opts).then(() => {
        let $modal = $('#'+opts.id)
        $modal.find('#image').attr('src', ipt.files[0].path).data('srcIpt', ipt)
        $modal.modal('show')
    }).catch(err => {
        console.error(err)
    })
}

module.exports = router
