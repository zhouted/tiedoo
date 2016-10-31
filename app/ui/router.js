const srvUser = require(appPath+'/service/user.js')

var router = {}

router.gohome = function(){
    srvUser.loadCurrent().then(curr => {
        if (curr && curr.active){
            srvUser.autoLogin(curr)
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
    return $('body').loadFile('ui/main/main.html').catch(err => {
        console.error(err)
    })
}
router.isLoadMain = function() {
    return $('body>#main').length
}

router.loadMainProduct = function() {
    return $('#main>main.tab-content').loadFile('ui/product/product.html').then(() => {
        $(window).trigger('resize');
    }).catch(err => {
        console.error(err)
    })
}

router.loadMainQuota = function() {
    return $('#main>main.tab-content').loadFile('ui/quota/quota.html').then(() => {
        $(window).trigger('resize');
    }).catch(err => {
        console.error(err)
    })
}

router.loadMainSetting = function() {
    return $('#main>main.tab-content').loadFile('ui/setting/setting.html').then(() => {
         $(window).trigger('resize');
    }).catch(err => {
        console.error(err)
    })
}

// 图片剪裁弹窗(传入file input)
router.showCropper = function(ipt){
    return $('body').addFile('ui/common/crop-modal.html').then(() => {
        let $modal = $('#cropModal')
        $modal.find('#image').attr('src', ipt.files[0].path).data('srcIpt', ipt)
        $modal.modal('show')
    }).catch(err => {
        console.error(err)
    })
}

module.exports = router
