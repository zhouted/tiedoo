/*
 * 为图片输入框增加图片剪裁的功能 based on cropper & crop-modal
 * @version     0.1.0
 * @author      Tiedoo
*/
(function($){
    $.fn.inputImg = function(opts){
        this.each(function(){
            initImgIpt(this, opts)
        })
        return this
    }

    function initImgIpt(ipt, opts){
        var $ipt = $(ipt)
        if (!$ipt.is('input[type=file]')){
            console.warn('Cropper\'s target should be "input[type=file]"!');
            return
        }

        let trigger = $ipt.attr('alt-trigger')
        if (trigger){
            $ipt.parent().find(trigger).click(function(){
                $ipt.click()
            })
        }

        let crop = $ipt.attr('alt-change')
        if (crop){//==cropper
            $ipt.data('cropOpts', opts)
            $ipt.change(function(){
                let src = this.files[0] && this.files[0].path
                if (!src) return
                router.showCropper(this)
            }).on('close.cropper', function(e){
                this.value = '' //重置file input
            })
        }
    }

})(jQuery)