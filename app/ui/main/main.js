const srvUser = require(appPath+'/service/user.js')

exports.init = function(binds){
    srvUser.load().then(user =>{
        showUserInfo(user)
    })

    $('body').on('changed.user', (e, user) => {
        showUserInfo(user)
    })

    function showUserInfo(user){
        user.name && $('.user-name').text(user.name)
        srvUser.loadImg(user.imageId).then(file => {
            file && $('.main .nav-user img').attr('src', file.path)
        })
    }

    $(window).on('resize', onResize)
    function onResize(){
        let height = window.innerHeight - $('#topbar').height() - 2 - 2;
        $('#sidebar').css('height', height);
        $('main.tab-content').css('height', height);
        //$('main.tab-content>.tab-pane').css('height', height);
    }
    onResize();

    $('#main>main.tab-content').scroll(function(){
		$(this).find('.rel-fixed').css('top', this.scrollTop);
	});
}
