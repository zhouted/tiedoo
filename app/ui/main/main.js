function init(){
    $(window).on('resize', onResize);
    function onResize(){
        let height = window.innerHeight - $('#topbar').height() - 20;
        $('#sidebar').css('height', height);
        $('main.tab-content').css('height', height);
    }
    onResize();
}

module.exports = {init}
