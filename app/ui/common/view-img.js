/**
 * 查看图片弹出框对应的js
 */
exports.prepare = function({pid}){
    let $modal = $('#' + pid)
    let $title = $modal.find(".modal-title")
    let $image = $modal.find('.img-responsive')

    //弹出处理
    $modal.on('show.bs.modal', function(event){
        //目标图片
        var $targetImg = $(event.relatedTarget).find("img:first")
        var title = $targetImg.attr("alt")
        title && $title.text(title)//目标图片的alt作为弹出框的标题
        //目标图片的src
        var src = $targetImg.attr("src")
        if (!src) return false
        if (src.match('nopic')) return false
        $image.attr("src", src)
    })
}
