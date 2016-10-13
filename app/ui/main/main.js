$(function(){
    $(window).on('resize', onResize);
    function onResize(){
        let height = window.innerHeight - $('#ahead').height() - $('#footer').height() - 100;
        $('aside').css('height', height);
        $('main').css('height', height);
    }
    onResize();
});
