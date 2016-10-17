const dsCur = require(appPath+'/mdl/current.js')
const dsUser = require(appPath+'/mdl/user.js')

function gohome(){
    dsCur.getCur().then(cur => {
        if (cur && cur.active){
            dsCur.save(cur)
            loadMain()
        }else{
            showLogin()
        }
    }).catch(err => {
        console.error(err)
    })
}

function showLogin() {
    $('body').loadFile('ui/login/login.html').catch(err => {
        console.error(err)
    })
}

function logout(){
    dsUser.logout().then(() => {
        showLogin()
    }).catch(err => {
        console.error(err)
    })
}

function showProfile() {
    let id = 'profile'
    $('body').addFile('ui/profile/profile.html', {
        id
    }).then(() => {
        $('#'+id).modal('show')
    }).catch(err => {
        console.error(err)
    })
}

function loadMain() {
    return $('body').loadFile('ui/main/main.html').catch(err => {
        console.error(err)
    })
}
function isLoadMain() {
    return $('body>#main').length
}

function loadMainProduct() {
    return $('#main>main.tab-content').loadFile('ui/product/product.html').then(() => {
        $(window).trigger('resize');
    }).catch(err => {
        console.error(err)
    })
}

function loadMainQuota() {
    return $('#main>main.tab-content').loadFile('ui/quota/quota.html').then(() => {
        $(window).trigger('resize');
    }).catch(err => {
        console.error(err)
    })
}

module.exports = {
    gohome,
    showLogin,
    logout,
    showProfile,
    loadMain, isLoadMain,
    loadMainProduct,
    loadMainQuota
}
