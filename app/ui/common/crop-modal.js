exports.onReady = function({pid}) {
    let $modal = $('#' + pid)
    let $image = $modal.find('#image')
    let $confirm = $modal.find('.btn.confirm')
    let srcIpt, $srcIpt

    let rect = {x:0, y:0}
    let dftOpts = {
        viewMode: 1,
        aspectRatio: 16 / 9,
        minCropBoxWidth: 100,
        crop: function(e) {
            rect.x = e.x
            rect.y = e.y
            rect.width = e.width
            rect.height = e.height
            // console.log(rect)
            // if (e.width < 200 || e.hegiht < 200){
            //     e.preventDefault()
            //     $(this).cropper('setCropBoxData', {left:e.x, top:e.y, width:200, height:200})
            // }
        }
    }

    $modal.off('show.bs.modal').on('show.bs.modal', initImage)
    $modal.off('shown.bs.modal').on('shown.bs.modal', initCropper)
    $modal.off('hidden.bs.modal').on('hidden.bs.modal', destroyCropper)
    $confirm.off('click').on('click', doneCropper)

    function initImage(){
        srcIpt = $image.data('srcIpt')
        $image.attr('src', srcIpt.files[0].path)
    }

    function initCropper(){
        $srcIpt = $($image.data('srcIpt'))
        let opts = $srcIpt.data('cropOpts')
        opts = tfn.clone(dftOpts, opts)
        $image.cropper(opts);
    }

    function doneCropper(){
        $confirm.button('loading')
        setTimeout(()=>{
            try{
                let file = {
                    path: srcIpt.files[0].path,
                    type: srcIpt.files[0].type,
                }
                let cropped = $image.cropper('getCroppedCanvas')
                file.data = cropped.toDataURL(file.type)
                $srcIpt.trigger('done.cropper', [file])
                $modal.modal('hide')
            }catch(err){
                console.error(err)
            }finally{
                $confirm.button('reset')
            }
        },100)
    }

    function destroyCropper(){
        $srcIpt.trigger('close.cropper')
        $image.cropper('destroy')
    }

}
