const mUser = require(appPath+'/mdl/user.js')

function init(){
    mUser.getCurUser().then(user =>{
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
        let height = window.innerHeight - $('#topbar').height() - 20;
        $('#sidebar').css('height', height);
        $('main.tab-content').css('height', height);
        $('main.tab-content>.tab-pane').css('height', height - 20);
    }
    onResize();
}

module.exports = {init}
