/*
 * 为图片输入框增加图片剪裁的功能 based on cropper & crop-modal
 * @version     0.1.0
 * @author      Tiedoo
*/
(function($){
    $.fn.cropImage = function(opts){
        if (!this.is('input[type=file]')){
            console.warn('Cropper\'s target should be "input[type=file]"!');
            return this
        }
        this.data('cropOpts', opts)
        this.change(function(){
            let src = this.files[0] && this.files[0].path
            if (!src) return
            router.showCropper(this)
        }).on('close.cropper', function(e){
            this.value = '' //重置file input
        })
        return this
    }

})(jQuery)
