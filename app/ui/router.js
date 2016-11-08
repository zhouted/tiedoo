const srvUser = require(appPath+'/service/user.js')

var router = {
    get $body(){
        return $('body')
    },
    get $main(){
        return $('#main')
    }
}

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
    router.$body.loadFile('ui/login/login.html').catch(err => {
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
    router.$body.loadFile('ui/main/main.html').then(()=>{
        let {panelId, data} = tfn.store('mainPanel')||{panelId:'settingPanel'}
        router.loadMainPanel(panelId, data)
    }).catch(err => {
        console.error(err)
    })
}

router.loadMainPanel = function(panelId, data) {
    router.$main.spv('open', panelId, data)
    tfn.store('mainPanel', {panelId, data})
}

// 图片剪裁弹窗(传入file input)
router.showCropper = function(ipt){
    let opts = {id: 'cropModal', append: true}
    return router.$body.loadFile('ui/common/crop-modal.html', opts).then(() => {
        let $modal = $('#'+opts.id)
        $modal.find('#image').attr('src', ipt.files[0].path).data('srcIpt', ipt)
        $modal.modal('show')
    }).catch(err => {
        console.error(err)
    })
}

module.exports = router
