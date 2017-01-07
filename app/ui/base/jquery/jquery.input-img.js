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
                if ($ipt.is('.disabled')) return false
                $ipt.click()
            })
        }

        let $img = $ipt.siblings('img')
        if ($img.length){
            $img.attr('alt-src', $img.attr('src')) //backup src
        }

        let crop = $ipt.attr('alt-change')
        if (crop){//==cropper
            $ipt.data('cropOpts', opts)
            $ipt.change(function(){
                let src = this.files[0] && this.files[0].path
                if (!src) return
                showCropper(this)
            }).on('close.cropper', function(){
                this.value = '' //重置file input
            })
        }
    }

    // 图片剪裁弹窗(传入file input)
    function showCropper(ipt){
        let opts = {id: 'cropModal', append: true}
        return router.$body.loadFile('ui/common/crop-modal.html', opts).then(() => {
            let $modal = $('#'+opts.id)
            $modal.find('#image').attr('src', ipt.files[0].path).data('srcIpt', ipt)
            $modal.modal('show')
        }).catch(err => {
            console.error(err)
        })
    }

})(jQuery)
