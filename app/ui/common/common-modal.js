exports.init = function({pid}) {
    let $modal = $('#' + pid)

    //修改 title && titleId
    let titleId = pid+'Label'
    $modal.attr('aria-labelledby', titleId)
    let $title = $modal.find('.modal-title').attr('id', titleId)
    $modal.on('show.bs.modal', () => {
        let title = $modal.data('title')
        title && $title.html(title)
    })

    let $confirm = $modal.find('.btn.confirm')
    console.log($modal)
}
