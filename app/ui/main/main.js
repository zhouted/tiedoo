require(appPath+'/ui/base/jquery/jquery.ctree.js')
require(appPath+'/ui/base/jquery/jquery.twbsPagination.js')
Object.assign($.fn.twbsPagination.defaults, {first: '«', prev: '‹', next: '›', last: '»'})

const srvUser = require(appPath+'/service/user.js')

exports.onReady = function({pid}){
    let $main = router.$main
    let $title = $main.find('.center-block .title')
    $main.on('opened.panel', (e, tab) => {
        tab&&tab.name&&$title.text(tab.name)
    })

    srvUser.load().then(user =>{
        showUserInfo(user)
    })

    $main.on('changed.user', (e, user) => {
        showUserInfo(user)
    })

    function showUserInfo(user){
        user.name && $main.find('.user-name').text(user.name)
        srvUser.loadImg(user.imageId).then(file => {
            file && $main.find('.nav-user img').attr('src', file.path)
        })
    }

    $(window).on('resize', onResize)
    function onResize(){
        let height = window.innerHeight - $('#topbar').height() - 2 - 2;
        $('#sidebar').css('height', height)
        $('main.tab-content').css('height', height)
        $('main.tab-content>.tab-pane').css('height', height).trigger('resize.td.page')
    }
    onResize()
}
