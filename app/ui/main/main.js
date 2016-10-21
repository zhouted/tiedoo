const srvLogin = require(appPath+'/service/login.js')

exports.init = function(binds){
    srvLogin.loadLoginUser().then(user =>{
        showUsername(user)
    })

    $('body').on('changed.profile', (e, user) => {
        showUsername(user)
    })

    function showUsername(user){
        user.name && $('.user-name').text(user.name)
    }

    $(window).on('resize', onResize)
    function onResize(){
        let height = window.innerHeight - $('#topbar').height() - 2 - 2;
        $('#sidebar').css('height', height);
        $('main.tab-content').css('height', height);
        $('main.tab-content>.tab-pane').css('height', height);
    }
    onResize();
}
