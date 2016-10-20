const mCur = require(appPath+'/mdl/current.js')
const mUser = require(appPath+'/mdl/user.js')

var router = {}
router.gohome = function(){
    mCur.getCur().then(cur => {
        if (cur && cur.active){
            mCur.save(cur)
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
    mUser.logout().then(() => {
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

module.exports = router
